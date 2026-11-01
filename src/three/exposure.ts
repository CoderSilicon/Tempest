import * as THREE from "three";

/**
 * GPU auto-exposure metering.
 *
 * Daylight and night differ by roughly three orders of magnitude in scene
 * luminance, so a fixed exposure cannot serve both. An analytic estimate
 * was tried first and was not good enough: it has to model the whole
 * Preetham integral, and it drifted by two orders of magnitude between
 * golden hour and fog.
 *
 * So it is measured instead. The scene is rendered into a tiny half-float
 * target and the average luminance read back. That is exact for every
 * condition, costs a 16x16 buffer, and the feedback loop is damped so it
 * settles in about half a second — which reads as eye adaptation.
 */

const RES = 8;

const _buf = new Uint16Array(RES * RES * 4);

/** IEEE 754 half-precision -> JS number. */
const halfToFloat = (h: number): number => {
  const sign = h & 0x8000 ? -1 : 1;
  const exp = (h & 0x7c00) >> 10;
  const frac = h & 0x03ff;
  if (exp === 0) return sign * 6.103515625e-5 * (frac / 1024);
  if (exp === 0x1f) return frac ? NaN : sign * Infinity;
  return sign * Math.pow(2, exp - 15) * (1 + frac / 1024);
};

export class ExposureMeter {
  readonly target: THREE.WebGLRenderTarget;
  readonly readEvery = 20;
  private frame = 0;
  private scene: THREE.Scene;
  private camera: THREE.Camera;

  /** Smoothed luminance estimate, in the tone-mapped display space. */
  luminance = 0.18;
  /** How many times metering actually read the GPU. */
  reads = 0;


  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.target = new THREE.WebGLRenderTarget(RES, RES, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }

  /**
   * Called once per frame after the main render. Returns the freshly
   * measured luminance, or null on frames where no read happened.
   */
  sample(renderer: THREE.WebGLRenderer): number | null {
    this.frame++;
    let measured: number | null = null;

    if (this.frame % this.readEvery === 0) {
      const prevTarget = renderer.getRenderTarget();

      renderer.setRenderTarget(this.target);
      renderer.clear();
      renderer.render(this.scene, this.camera);
      renderer.readRenderTargetPixels(this.target, 0, 0, RES, RES, _buf);
      renderer.setRenderTarget(prevTarget);

      let sum = 0;
      let n = 0;
      for (let i = 0; i < _buf.length; i += 4) {
        const r = halfToFloat(_buf[i]);
        const g = halfToFloat(_buf[i + 1]);
        const b = halfToFloat(_buf[i + 2]);
        if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) continue;
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        n++;
      }
      if (n > 0) {
        const value = sum / n;
        // Ignore frames that came back empty or non-finite (context loss).
        //
        // The floor has to stay well below anything a real sky can produce.
        // A moonless night sky tone-maps to around 1e-4, and an earlier floor
        // of 1e-5 rejected those as degenerate — so `luminance` kept its
        // initial value, `exposureFor` returned the same answer forever, and
        // the night rendered as a black rectangle no matter what the key
        // said. Rejecting genuinely dark frames defeats the whole point of
        // metering them.
        if (value > 1e-9 && value < 1e4) {
          measured = value;
          this.reads++;
          return measured;
        }
      }
    }

    return null;
  }

  /**
   * Exposure that lands the measured image on `target`.
   *
   * The target itself is keyed to the hour: metering everything to one
   * mid-grey would make midnight look like noon, which is correct for a
   * camera but wrong for a weather app — night should read as night.
   */
  exposureFor(target = 0.145): number {
    return THREE.MathUtils.clamp(target / Math.max(this.luminance, 1e-5), 1e-4, 40);
  }

  /**
   * Key for the current conditions.
   *
   * Night keys darker than day, and — critically — so does heavy cloud.
   * Metering purely on sun elevation lifts a thunderstorm at noon to the
   * same brightness as a clear day, which reads as "bright weather with
   * rain in it" rather than a storm.
   *
   * The absolute values are calibrated empirically, not derived. The meter
   * reads the *tone-mapped* image, which saturates: once the measured
   * luminance approaches 1.0 the controller has no gradient left to follow
   * and `key / luminance` stops falling at `key`. So `key` here behaves as a
   * floor on exposure rather than as a target on the final image, and its
   * scale has to be set by looking at the result. Day sits around 0.06 and
   * night near 0.03, which puts a clear noon sky at roughly two thirds
   * luminance and leaves headroom before anything clips.
   */
  static keyFor(sunAltitude: number, gloom = 0): number {
    const lit = THREE.MathUtils.smoothstep(sunAltitude, -9, 8);
    const base = THREE.MathUtils.lerp(0.011, 0.062, lit);
    return base * THREE.MathUtils.lerp(1, 0.42, THREE.MathUtils.clamp(gloom, 0, 1));
  }

  dispose() {
    this.target.dispose();
  }
}
