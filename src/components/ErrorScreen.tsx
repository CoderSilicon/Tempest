import { createSignal, Show, type Component } from "solid-js";
import { searchCity } from "../libs/weatherApi";

interface Props {
  message: string;
  onRetry: () => void;
}

export const ErrorScreen: Component<Props> = (props) => {
  const [query, setQuery] = createSignal("");
  const [busy, setBusy] = createSignal(false);
  const [hint, setHint] = createSignal<string | null>(null);

  // searchCity stores the city it found, and loadWeather picks that up on
  // the next pass — so a reload is what applies the lookup.
  const lookup = async (e: Event) => {
    e.preventDefault();
    setBusy(true);
    setHint(null);
    try {
      await searchCity(query());
      window.location.reload();
    } catch (err) {
      setHint(err instanceof Error ? err.message : "Lookup failed.");
      setBusy(false);
    }
  };

  return (
    <div class="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-950 px-6 text-center">
      <div class="max-w-md space-y-3">
        <h1 class="dm-sans-300 text-2xl tracking-tight text-foreground">
          The sky isn't answering
        </h1>
        <p class="dm-sans-400 text-sm leading-relaxed text-muted-foreground">
          {props.message}
        </p>
      </div>

      <form onSubmit={lookup} class="flex w-full max-w-sm items-center gap-2">
        <input
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          placeholder="or type a city…"
          class="dm-sans-400 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-white/35 focus:border-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy()}
          class="dm-sans-400 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {busy() ? "…" : "Find"}
        </button>
      </form>

      <Show when={hint()}>
        <p class="dm-sans-400 -mt-4 text-xs text-red-300/80">{hint()}</p>
      </Show>

      <button
        onClick={props.onRetry}
        class="dm-sans-400 text-xs uppercase tracking-[0.25em] text-white/50 underline-offset-4 transition-colors hover:text-white/80 hover:underline"
      >
        try again
      </button>
    </div>
  );
};
