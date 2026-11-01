import * as THREE from "three";
import { TIER_SCALE, type Tier } from "./perf";

export interface PrecipParams {
  kind: "rain" | "snow" | null;
  intensity: number;
  /** m/s */
  windSpeed: number;
  /** meteorological bearing the wind blows from */
  windDeg: number;
  tempC: number;
  time: number;
}

/**
 * Fullscreen precipitation volume.
 *
 * This is the part of Tempest that must never be allowed to hurt anyone,
 * so the budget is deliberately small: thin streaks have very little fill
 * area, which keeps overdraw low even in software rasterisation. The
 * earlier 9,000-quad additive-blended build locked the machine; this is
 * ~800 hairline quads in the worst case, scaled further by PerfGuard.
 */
const MAX = { rain: 1100, snow: 850 };

const NEAR_Z = 12;
const FAR_Z = 24;
const HALF_H = 5.5;

export class Precipitation {
  readonly mesh: THREE.Mesh;
  private mat: THREE.ShaderMaterial;
  private pos: Float32Array;
  private angle: Float32Array;
  private stretch: Float32Array;
  private size: Float32Array;
  private alpha: Float32Array;

  private aPos: THREE.InstancedBufferAttribute;
  private aAngle: THREE.InstancedBufferAttribute;
  private aStretch: THREE.InstancedBufferAttribute;
  private aSize: THREE.InstancedBufferAttribute;
  private aAlpha: THREE.InstancedBufferAttribute;

  kind: "rain" | "snow" | null = null;
  private geo: THREE.InstancedBufferGeometry;
  private halfW = 8;
  private count = 0;

  private seed: Float32Array;

  constructor() {
    const total = MAX.rain + MAX.snow;
    this.pos = new Float32Array(total * 3);
    this.seed = new Float32Array(total * 4);
    this.angle = new Float32Array(total);
    this.stretch = new Float32Array(total);
    this.size = new Float32Array(total);
    this.alpha = new Float32Array(total);

    for (let i = 0; i < total; i++) {
      this.seed[i * 4] = Math.random(); // phase
      this.seed[i * 4 + 1] = 0.7 + Math.random() * 0.6; // fall variance
      this.seed[i * 4 + 2] = Math.random(); // size variance
      this.seed[i * 4 + 3] = Math.random() * Math.PI * 2; // sway phase
    }

    const base = new THREE.PlaneGeometry(1, 1);
    const geo: THREE.InstancedBufferGeometry = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.attributes.position = base.attributes.position;
    geo.attributes.uv = base.attributes.uv;

    this.aPos = new THREE.InstancedBufferAttribute(this.pos, 3);
    this.aAngle = new THREE.InstancedBufferAttribute(this.angle, 1);
    this.aStretch = new THREE.InstancedBufferAttribute(this.stretch, 1);
    this.aSize = new THREE.InstancedBufferAttribute(this.size, 1);
    this.aAlpha = new THREE.InstancedBufferAttribute(this.alpha, 1);
    for (const a of [this.aPos, this.aAngle, this.aStretch, this.aSize, this.aAlpha]) {
      a.setUsage(THREE.DynamicDrawUsage);
    }
    geo.setAttribute("iPos", this.aPos);
    geo.setAttribute("iAngle", this.aAngle);
    geo.setAttribute("iStretch", this.aStretch);
    geo.setAttribute("iSize", this.aSize);
    geo.setAttribute("iAlpha", this.aAlpha);
    geo.instanceCount = 0;

    this.mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uRain: { value: 1 },
        uTint: { value: new THREE.Color("#cfe4ff") },
      },
      vertexShader: /* glsl */ `
        attribute vec3 iPos;
        attribute float iAngle;
        attribute float iStretch;
        attribute float iSize;
        attribute float iAlpha;
        varying vec2 vUv;
        varying float vAlpha;
        varying float vStretch;

        void main() {
          vUv = uv;
          vAlpha = iAlpha;
          vStretch = iStretch;

          vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
          float c = cos(iAngle);
          float s = sin(iAngle);
          vec2 local = position.xy * vec2(iSize, iSize * iStretch);
          mv.xy += vec2(local.x * c - local.y * s, local.x * s + local.y * c);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uRain;
        uniform vec3 uTint;
        varying vec2 vUv;
        varying float vAlpha;
        varying float vStretch;

        void main() {
          vec2 p = vUv - 0.5;
          float a;

          if (uRain > 0.5) {
            // Hairline streak: bright along its length, soft across it.
            float across = 1.0 - smoothstep(0.0, 0.5, abs(p.x) * 2.0);
            float along = 1.0 - smoothstep(0.25, 0.5, abs(p.y) * 2.0);
            a = across * along;
          } else {
            // Soft round flake with a tight core.
            float d = length(p) * 2.0;
            a = (1.0 - smoothstep(0.0, 0.4, d)) * 0.85
              + (1.0 - smoothstep(0.15, 1.0, d)) * 0.35;
          }

          a *= vAlpha;
          if (a < 0.008) discard;
          gl_FragColor = vec4(uTint, a);
        }
      `,
    });

    this.geo = geo;
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 10;
  }

  setKind(kind: "rain" | "snow" | null) {
    this.kind = kind;
    this.mat.uniforms.uRain.value = kind === "rain" ? 1 : 0;
    if (!kind) {
      this.count = 0;
      this.geo.instanceCount = 0;
      return;
    }
    // Reseed positions when switching so we never inherit a stale layout.
    for (let i = 0; i < this.pos.length / 3; i++) {
      this.pos[i * 3] = (Math.random() - 0.5) * this.halfW * 2;
      this.pos[i * 3 + 1] = (Math.random() - 0.5) * HALF_H * 2;
      this.pos[i * 3 + 2] = NEAR_Z + Math.random() * (FAR_Z - NEAR_Z);
    }
  }

  resize(aspect: number) {
    this.halfW = HALF_H * aspect;
  }

  update(dt: number, p: PrecipParams, tier: Tier) {
    if (!p.kind) return;

    const target = MAX[p.kind];
    const wanted = Math.floor(
      target * THREE.MathUtils.lerp(0.55, 1, (p.intensity - 1) / 2) * TIER_SCALE[tier],
    );
    this.count = Math.max(0, Math.min(target, wanted));
    this.geo.instanceCount = this.count;
    if (this.count === 0) return;

    const rain = p.kind === "rain";

    // "from" bearing -> direction of travel.
    const rad = ((p.windDeg + 180) * Math.PI) / 180;
    const windX = -Math.sin(rad) * p.windSpeed;

    // Rain terminal velocity ~7-9 m/s; snow settles far slower. Keeping
    // both in the same units is what makes the wind lean honest.
    const wet = THREE.MathUtils.clamp((2 - p.tempC) / 7, 0, 1);
    const fall = rain
      ? 8.0 + p.windSpeed * 0.2
      : THREE.MathUtils.lerp(1.5, 2.6, wet);

    const drift = windX * (rain ? 0.9 : 1.35);
    const swayAmp = rain ? 0 : 0.45 + Math.min(p.windSpeed, 12) * 0.08;

    for (let i = 0; i < this.count; i++) {
      const o = i * 3;
      const s = i * 4;

      const sway = swayAmp * Math.sin(p.time * 1.1 + this.seed[s + 3]);
      this.pos[o] += (drift + sway) * dt;
      this.pos[o + 1] -= fall * this.seed[s + 1] * dt;
      // Slow lateral recycle keeps the volume populated without popping.
      this.pos[o + 2] += 0.4 * dt;

      if (this.pos[o + 1] < -HALF_H) {
        this.pos[o + 1] += HALF_H * 2;
        this.pos[o] = (Math.random() - 0.5) * this.halfW * 2;
      }
      if (this.pos[o] < -this.halfW) this.pos[o] += this.halfW * 2;
      if (this.pos[o] > this.halfW) this.pos[o] -= this.halfW * 2;
      if (this.pos[o + 2] > FAR_Z) this.pos[o + 2] = NEAR_Z;

      // Perspective parallax: nearer = larger, faster, brighter.
      const depth = (this.pos[o + 2] - NEAR_Z) / (FAR_Z - NEAR_Z);
      const near = 1 - depth;

      const base = rain ? 0.014 : 0.05;
      this.size[i] = (base + near * base * 2.4) * this.seed[s + 2];
      this.alpha[i] = rain
        ? (0.10 + near * 0.30)
        : (0.18 + near * 0.55) * (0.7 + this.seed[s + 2] * 0.3);

      // Stretch along the true velocity vector.
      const vx = drift + sway;
      const vy = -fall * this.seed[s + 1];
      this.angle[i] = Math.atan2(vy, vx) + Math.PI / 2;
      const speed = Math.hypot(vx, vy);
      this.stretch[i] = rain
        ? THREE.MathUtils.clamp(speed / 2.2, 1.6, 11)
        : 1;
    }

    this.aPos.needsUpdate = true;
    this.aAngle.needsUpdate = true;
    this.aStretch.needsUpdate = true;
    this.aSize.needsUpdate = true;
    this.aAlpha.needsUpdate = true;
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
  }
}
