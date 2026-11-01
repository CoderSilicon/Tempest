import { createEffect, onCleanup, type Component } from "solid-js";
import * as THREE from "three";
import type { WeatherData } from "../types/weather";
import { calculateWeatherScene, type Scene } from "../libs/Scene";
import { Sky } from "../three/sky";
import { Precipitation } from "../three/precipitation";
import { lunarPosition, solarPosition } from "../three/solar";
import { ExposureMeter } from "../three/exposure";
import { MAX_DPR } from "../three/perf";
import {
  PerfGuard,
  createRenderer,
  damp,
  TIER_RES,
  type Tier,
} from "../three/perf";

interface Props {
  /** null while the request is in flight — the sky still renders. */
  data: WeatherData | null;
}

/** Local hour -> a plausible default condition, so the first frame has a sky. */
const fallbackScene = (): Scene => {
  const h = new Date().getHours();
  const day = h >= 6 && h < 19;
  return { type: day ? "clear" : "night", intensity: 1, day };
};

/**
 * How much cloud detail the shader may afford, per tier.
 *
 * The deck is three stacked sheets, each costing a density evaluation plus a
 * two-tap sun march, so it is by far the heaviest thing in the frame. This is
 * the first thing to give ground when frames run long.
 *
 * At 0.5 the shader drops the nearest sheet entirely — two sheets still read
 * as a layered deck — and erosion keeps a floor, because without any the deck
 * collapses back into airbrushed blobs, which was the original problem.
 */
const detailBudget: Record<Tier, number> = {
  high: 1,
  medium: 0.45,
  low: 0.2,
};

/**
 * The backdrop: atmosphere and weather, and nothing else.
 *
 * Deliberately no 3D text and no floating condition object — those fought
 * the sky for attention. The readout lives in the DOM, set as type.
 */
export const WeatherWorld: Component<Props> = (props) => {
  let canvasRef!: HTMLCanvasElement;

  createEffect(() => {
    const canvas = canvasRef;
    // Read every field once, up front. The effect must not track props,
    // or a weather refresh would tear down the whole GL context.
    const d = props.data;
    const scene: Scene = d ? calculateWeatherScene(d) : fallbackScene();

    const renderer = createRenderer(canvas);
    const three = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    camera.position.set(0, 0, 26);

    const sky = new Sky();
    three.add(sky.mesh);

    const precip = new Precipitation();
    three.add(precip.mesh);
    const precipKind =
      scene.type === "snow" ? "snow" : scene.type === "rain" ? "rain" : null;
    precip.setKind(precipKind);

    /* ── sun and moon, both real ──────────────────────────────── */
    // Without data yet, use the viewer's own clock so the first sky is
    // right for them rather than for Greenwich.
    const stamp = d ? d.dt : Math.floor(Date.now() / 1000);
    const lat = d ? d.coord.lat : 0;
    const lon = d ? d.coord.lon : 0;
    const sun = solarPosition(stamp, lat, lon);
    const moon = lunarPosition(stamp, lat, lon);

    let resScale = 1;

    const place = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Resolution scale rides on top of the DPR cap.
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, MAX_DPR) * resScale,
      );
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      precip.resize(w / h);
    };
    place();

    const onResize = () => place();
    window.addEventListener("resize", onResize);

    // --- Pointer parallax: the sky leans toward the cursor ---
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let tier: Tier = "high";
    const guard = new PerfGuard((t) => {
      tier = t;
      const next = TIER_RES[t];
      if (next !== resScale) {
        resScale = next;
        place();
      }
    });

    /* ── lightning ──────────────────────────────────────────────
       Strokes, not a strobe: a fast rise, a double-tap, then a long
       decay. Kept above ~3 Hz overall so photosensitivity is not a
       concern, and skipped entirely if the user asked for less motion.
    */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stormy = scene.type === "rain" && scene.intensity >= 3;
    let flash = 0;
    let nextStrike = stormy && !reduced ? 2 + Math.random() * 5 : Infinity;
    let strike = 1;

    const stepLightning = (dt: number, t: number) => {
      if (!Number.isFinite(nextStrike)) return 0;
      if (t > nextStrike) {
        nextStrike = t + 3 + Math.random() * 9;
        strike = 1;
      }
      if (strike >= 1) return flash;
      strike += dt;
      // envelope: sharp onset, secondary tap, exponential tail
      const a = Math.exp(-(strike - 0.02) * 26);
      const b = 0.45 * Math.exp(-Math.max(0, strike - 0.16) * 11);
      flash = Math.min(1, (a + b) * (0.65 + Math.random() * 0.35));
      if (strike > 1.1) flash = 0;
      return flash;
    };

    const clock = new THREE.Clock();
    let raf = 0;
    const look = { x: 0, y: 0 };

    /* ── eye adaptation ──────────────────────────────────────────
       Measured off the GPU rather than guessed; see three/exposure.ts.
       The damp() gives the slow, iris-like transition, which is what
       makes dawn fade up instead of snapping.
    */
    const meter = new ExposureMeter(three, camera);
    let exposure = 0.03;

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;

      const lightning = stepLightning(dt, time);

      sky.update({
        sun,
        moon,
        scene,
        humidity: d?.main.humidity ?? 55,
        visibility: d?.visibility ?? 10000,
        pressure: d?.main.pressure ?? 1013,
        windSpeed: d?.wind.speed ?? 3,
        windDeg: d?.wind.deg ?? 0,
        latitude: lat,
        tempC: d?.main.temp ?? 8,
        cloudCover: d?.clouds.all ?? 25,
        time,
        lightning,
        detail: detailBudget[tier],
      });

      precip.update(
        dt,
        {
          kind: precipKind,
          intensity: scene.intensity,
          windSpeed: d?.wind.speed ?? 3,
          windDeg: d?.wind.deg ?? 0,
          tempC: d?.main.temp ?? 4,
          time,
        },
        tier,
      );

      pointer.x = damp(pointer.x, pointer.tx, 4, dt);
      pointer.y = damp(pointer.y, pointer.ty, 4, dt);
      look.x = damp(look.x, pointer.x * 0.4, 4, dt);
      look.y = damp(look.y, pointer.y * 0.22, 4, dt);
      camera.position.x = look.x;
      camera.position.y = -look.y;

      // Tilt gently toward the sun as it climbs. At solar noon it sits
      // above the frame — which is geometrically honest — but during the
      // golden hours the disc should actually be visible.
      //
      // The floor matters as much as the slope. A cloud deck is read from
      // almost overhead; seen from a few degrees above the horizon it
      // compresses to a band of streaks no shader can resolve. Tying the
      // tilt purely to sun altitude means a low sun gives the worst framing,
      // so there is always some lift toward the sky.
      const pitch =
        sun.altitude > 0
          ? Math.min(4.6, 1.9 + sun.altitude * 0.1)
          : 0;
      camera.lookAt(look.x * 0.2, pitch + look.y * -0.08, 0);

      renderer.render(three, camera);

      // Meter, then correct. Runs after the main pass so the readback
      // sees exactly what was displayed.
      const measured = meter.sample(renderer);
      if (measured !== null) {
        // Converge fast on the first fix, then settle slowly.
        if (meter.reads === 1) meter.luminance = measured;
        else meter.luminance = damp(meter.luminance, measured, 3.5, dt * meter.readEvery);
      }
      // How sombre the conditions are. This is the master "how dark should
      // the world feel" term, so every physical input that dims the sky has
      // to feed it — otherwise a low-pressure overcast would render as
      // bright as a clear day because the exposure meter would compensate.
      const cover = (d?.clouds.all ?? 30) / 100;
      const gloom =
        // Cloud blocks the sun: the single biggest lever.
        cover * 0.55 +
        // Low pressure means a deep, thick deck.
        THREE.MathUtils.clamp((1013.25 - (d?.main.pressure ?? 1013)) / 30, 0, 1) * 0.18 +
        // Precipitation.
        (precipKind ? 0.16 + scene.intensity * 0.06 : 0) +
        // Thick air.
        (1 - THREE.MathUtils.clamp((d?.visibility ?? 10000) / 10000, 0, 1)) * 0.14 +
        (scene.type === "fog" ? 0.3 : 0);
      exposure = damp(
        exposure,
        meter.exposureFor(ExposureMeter.keyFor(sun.altitude, gloom)),
        2.2,
        dt,
      );
      renderer.toneMappingExposure = exposure;

      raf = requestAnimationFrame(frame);
      guard.sample(performance.now(), dt * 1000);

      if (import.meta.env.DEV) {
        (window as unknown as Record<string, unknown>).__world = {
          three, camera, sky, precip, renderer, sun, moon, meter,
        };
      }
    };
    raf = requestAnimationFrame(frame);

    onCleanup(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      meter.dispose();
      sky.dispose();
      precip.dispose();
      renderer.dispose();
    });
  });

  return (
    <canvas
      ref={canvasRef}
      class="fixed inset-0 z-0 block h-full w-full"
      aria-hidden="true"
    />
  );
};
