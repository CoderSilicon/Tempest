import { Match, Show, Switch, createSignal, onMount, type Component } from "solid-js";
import { WeatherMain } from "./components/Weather";
import { WeatherWorld } from "./components/WeatherWorld";
import { ErrorScreen } from "./components/ErrorScreen";
import {
  loadWeather,
  readCache,
  type LoadProgress,
} from "./libs/weatherApi";
import type { WeatherData } from "./types/weather";

const App: Component = () => {
  const [data, setData] = createSignal<WeatherData | null>(null);
  const [progress, setProgress] = createSignal<LoadProgress>({
    stage: "locating",
    progress: 0.05,
    label: "waking up",
  });
  const [error, setError] = createSignal<string | null>(null);
  const [located, setLocated] = createSignal(true);

  const run = async () => {
    // Cache first: if we've been here in the last 15 minutes, the world
    // is already up and the refresh happens invisibly behind it.
    const cached = readCache();
    if (cached) {
      setData(cached);
      setLocated(true);
    }

    try {
      const { data: fresh, located: didLocate } = await loadWeather((p) =>
        setProgress(p),
      );
      setLocated(didLocate);
      setData(fresh);
    } catch (err) {
      if (!cached) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }
  };

  onMount(run);

  return (
    <Switch>
      <Match when={error()}>
        {(msg) => <ErrorScreen message={msg()} onRetry={run} />}
      </Match>

      <Match when={true}>
        {/* The sky mounts on frame one, before any network call resolves,
            and patches itself when the data lands. */}
        <WeatherWorld data={data()} />

        <Show when={data()}>
          {(d) => <WeatherMain data={d()} located={located()} />}
        </Show>

        <Show when={!data()}>
          <div class="pointer-events-none fixed inset-0 z-30 flex items-end justify-center pb-16">
            <div class="flex flex-col items-center gap-3">
              <div class="h-px w-32 overflow-hidden bg-white/15">
                <div
                  class="h-full bg-white transition-[width] duration-700 ease-out"
                  style={{ width: `${Math.round(progress().progress * 100)}%` }}
                />
              </div>
              <p class="dm-sans-300 text-[10px] uppercase tracking-[0.35em] text-white/50">
                {progress().label}
              </p>
            </div>
          </div>
        </Show>
      </Match>
    </Switch>
  );
};

export default App;
