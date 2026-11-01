import * as THREE from "three";

/**
 * Hard ceilings. Tempest renders a full-screen WebGL scene behind the UI,
 * so the two failure modes are fill rate (huge transparent overdraw) and
 * pixel count (DPR on a 4K/retina panel). Both are clamped here, once.
 */
export const MAX_DPR = 1.5;

/** Quality tiers, dropped automatically if frames run long. */
export type Tier = "high" | "medium" | "low";

/** Particle density multiplier per tier. */
export const TIER_SCALE: Record<Tier, number> = {
  high: 1,
  medium: 0.55,
  low: 0.42,
};

/**
 * Internal render-resolution multiplier per tier.
 *
 * The backdrop is almost entirely low-frequency — a scattering gradient
 * with soft cloud on top — so rendering it below native and letting the
 * compositor upscale is close to invisible, while cutting fragment cost
 * quadratically. Only the finest star cores suffer, and they are drawn
 * with a gaussian wide enough to survive it.
 */
export const TIER_RES: Record<Tier, number> = {
  high: 1,
  medium: 0.78,
  low: 0.58,
};

export const createRenderer = (canvas: HTMLCanvasElement) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
    stencil: false,
    depth: true,
    // Dev only: lets tooling read the framebuffer back for luminance
    // checks. Off in production, where it costs a copy every frame.
    preserveDrawingBuffer: import.meta.env.DEV,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));

  // The atmosphere is a physically-based HDR model: it outputs values well
  // above 1.0 and relies on a tone-mapping curve to resolve them. Without
  // this the sky clips to flat white the moment the sun is up.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.028;

  return renderer;
};

/**
 * Watches real frame times and steps the scene down a tier if we can't
 * hold the budget. Prevents the "opened the tab and the fans spun up"
 * failure mode without the user having to configure anything.
 */
export class PerfGuard {
  private samples: number[] = [];
  private lastCheck = 0;
  private onChange: (tier: Tier) => void;
  tier: Tier = "high";

  constructor(onChange: (tier: Tier) => void) {
    this.onChange = onChange;
  }

  /** @returns true if the tier changed on this frame */
  sample(now: number, dtMs: number): boolean {
    this.samples.push(dtMs);
    if (this.samples.length > 60) this.samples.shift();

    if (now - this.lastCheck < 1500 || this.samples.length < 45) return false;
    this.lastCheck = now;

    // Ignore the first second of compile/upload spikes.
    const sorted = [...this.samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    let next = this.tier;
    if (median > 26 && this.tier === "high") next = "medium";
    else if (median > 30 && this.tier === "medium") next = "low";
    else if (median < 15 && this.tier === "low") next = "medium";
    else if (median < 13 && this.tier === "medium") next = "high";

    if (next !== this.tier) {
      this.tier = next;
      this.onChange(next);
      return true;
    }
    return false;
  }
}

/** Shared easing + clamp helpers used by the scenes. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
