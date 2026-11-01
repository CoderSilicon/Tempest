import { Show, type Component } from "solid-js";
import type { WeatherData } from "../types/weather";
import { compassLabel } from "../three/solar";

/**
 * Flat type over a 3D sky.
 *
 * The readout is anchored to the bottom edge so the upper two thirds of the
 * frame stay open sky — the backdrop is the point of the app, and a centred
 * stack was covering it. One scrim carries the whole lower block; the header
 * sits on a shallow one of its own.
 */

const Stat: Component<{ label: string; value: string; unit?: string }> = (
  p,
) => (
  <div class="flex flex-col gap-1">
    <span class="dm-sans-300 text-[10px] uppercase tracking-[0.28em] text-white/55">
      {p.label}
    </span>
    <span class="dm-sans-300 text-lg font-light tabular-nums text-white/90">
      {p.value}
      {p.unit && <span class="text-white/50"> {p.unit}</span>}
    </span>
  </div>
);

export function WeatherMain(props: { data: WeatherData; located: boolean }) {
  const temp = () => Math.round(props.data.main.temp);
  const feels = () => Math.round(props.data.main.feels_like);
  const high = () => Math.round(props.data.main.temp_max);
  const low = () => Math.round(props.data.main.temp_min);
  const windKmh = () => Math.round(props.data.wind.speed * 3.6);
  const visibility = () => Math.round(props.data.visibility / 1000);

  // The location's clock, not the viewer's.
  const localTime = () => {
    const shifted = new Date(
      (props.data.dt + (props.data.timezone ?? 0)) * 1000,
    );
    return shifted.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  return (
    <>
      {/* The sky itself is mounted once, by App, so it can appear before
          any data arrives. Rendering it here as well produced a second
          live WebGL context and a second render loop.

          Contrast. A scrim alone is not enough: fog renders a near-white
          sky, and white type on it disappears. These guarantee the
          readout stays legible against anything the atmosphere does. */}
      <div class="pointer-events-none fixed inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      <main class="relative z-20 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6">
        {/* ── Top edge ────────────────────────────────────────
            Only what belongs on an edge: where you are, and the
            local clock. Everything with real weight lives at the
            bottom. */}
        <header class="flex items-start justify-between gap-4 pt-9">
          <h1 class="dm-sans-300 flex items-baseline gap-1.5 text-xl font-light tracking-tight text-white">
            <span class="font-normal">{props.data.name}</span>
            <span class="text-xs text-white/40">{props.data.sys.country}</span>
          </h1>

          <span class="dm-sans-300 shrink-0 text-xl font-light tabular-nums text-white/85">
            {localTime()}
          </span>
        </header>

        {/* ── Open sky ─────────────────────────────────────────
            Deliberately empty. The height is what the layout is
            built around. */}
        <div class="min-h-16 flex-1" aria-hidden="true" />

        {/* ── Bottom block ─────────────────────────────────────
            Temperature anchors the left, the numbers sit opposite
            it on a shared baseline, and the one continuous value
            runs beneath both.

            The scrim hangs off this block rather than off the
            viewport, because on a short screen the readout is most
            of the frame: a half-height scrim left the stat labels
            stranded in bright cloud. */}
        <footer class="relative pb-9 md:pb-12">
          <div
            class="pointer-events-none absolute bottom-0 left-[calc(50%_-_50vw)] right-[calc(50%_-_50vw)] top-[-9rem] bg-gradient-to-t from-black/75 via-black/40 to-transparent"
            aria-hidden="true"
          />

          <div class="relative grid items-end gap-8 md:grid-cols-[auto_1fr] md:gap-12">
            <div class="flex flex-col gap-3">
              <div class="flex items-start leading-none">
                <span class="dm-sans-200 tabular-nums select-none text-[clamp(6rem,min(30vw,26vh),14rem)] font-extralight tracking-[-0.045em] text-white [text-shadow:0_2px_40px_rgba(0,0,0,0.55)]">
                  {temp()}
                </span>
                <span class="dm-sans-200 mt-[0.04em] text-[clamp(2.2rem,min(9vw,7.8vh),4.5rem)] font-extralight leading-none text-white/80 [text-shadow:0_2px_30px_rgba(0,0,0,0.5)]">
                  °
                </span>
              </div>

              <div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <span class="dm-sans-300 text-[11px] uppercase tracking-[0.3em] text-white/65">
                  {props.data.weather[0].description}
                </span>
                <span class="dm-sans-300 text-[11px] tabular-nums text-white/55">
                  feels {feels()}°
                </span>
                <span class="dm-sans-300 text-[11px] tabular-nums text-white/55">
                  {high()}° / {low()}°
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-x-8 gap-y-7 sm:gap-x-10 md:justify-self-end md:max-w-md md:grid-cols-2">
              <Stat
                label="Wind"
                value={`${windKmh()}`}
                unit={`km/h ${compassLabel(props.data.wind.deg + 180)}`}
              />
              <Stat
                label="Humidity"
                value={`${props.data.main.humidity}`}
                unit="%"
              />
              <Stat label="Visibility" value={`${visibility()}`} unit="km" />
              <Stat
                label="Pressure"
                value={`${props.data.main.pressure}`}
                unit="hPa"
              />
            </div>
          </div>

          {/* Cloud cover is the one continuous value, so it gets the
              only graphic element in the readout. */}
          <div class="relative mt-8 flex items-center gap-4">
            <span class="dm-sans-300 shrink-0 text-[10px] uppercase tracking-[0.28em] text-white/55">
              Cloud
            </span>
            <div class="h-px flex-1 bg-white/25">
              <div
                class="h-px bg-white/70 transition-[width] duration-700"
                style={{ width: `${props.data.clouds.all}%` }}
              />
            </div>
            <span class="dm-sans-300 w-9 shrink-0 text-right text-[11px] tabular-nums text-white/50">
              {props.data.clouds.all}%
            </span>
          </div>

          <Show when={!props.located}>
            <p class="dm-sans-300 relative mt-6 text-[10px] uppercase tracking-[0.25em] text-white/30">
              approximate location
            </p>
          </Show>
        </footer>
      </main>
    </>
  );
}
