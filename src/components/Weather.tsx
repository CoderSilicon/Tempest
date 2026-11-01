import { createSignal, Show, type Component } from "solid-js";
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

export function WeatherMain(props: {
  data: WeatherData;
  located: boolean;
  onSearch: (query: string) => Promise<void>;
  searching: boolean;
  searchError: string | null;
}) {
  const [query, setQuery] = createSignal("");
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

  const submitSearch = (event: Event) => {
    event.preventDefault();
    const value = query().trim();
    if (value) void props.onSearch(value);
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
        <header class="flex flex-wrap items-start justify-between gap-x-4 gap-y-4 pt-7 sm:pt-9">
          <h1 class="dm-sans-300 flex items-baseline gap-1.5 text-xl font-light tracking-tight text-white">
            <span class="font-normal">{props.data.name}</span>
            <span class="text-xs text-white/40">{props.data.sys.country}</span>
          </h1>

          <div class="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-start sm:gap-5">
            <form
              onSubmit={submitSearch}
              role="search"
              class="group flex h-11 w-full items-center gap-3 rounded-sm border border-white/20 bg-black/20 px-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md transition-colors focus-within:border-white/55 sm:w-72"
            >
              <span
                aria-hidden="true"
                class="relative h-3.5 w-3.5 shrink-0 rounded-full border border-white/60 after:absolute after:-bottom-1 after:-right-1 after:h-1.5 after:w-px after:rotate-[-45deg] after:bg-white/60"
              />
              <input
                value={query()}
                onInput={(event) => setQuery(event.currentTarget.value)}
                aria-label="Search locations"
                placeholder="Find another place"
                autocomplete="off"
                class="dm-sans-300 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
              />
              <button
                type="submit"
                aria-label="Search"
                disabled={props.searching || !query().trim()}
                class="dm-sans-300 border-l border-white/20 pl-3 text-[10px] uppercase tracking-[0.18em] text-white/75 transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-white/30"
              >
                {props.searching ? "..." : "Go"}
              </button>
            </form>
            <span class="dm-sans-300 shrink-0 self-end text-xl font-light tabular-nums text-white/85 sm:self-auto">
              {localTime()}
            </span>
          </div>
          <Show when={props.searchError}>
            <p role="status" class="dm-sans-300 -mt-2 w-full text-xs text-rose-100/90 sm:ml-auto sm:w-72">
              {props.searchError}
            </p>
          </Show>
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
