import axios from "axios";
import type { WeatherData } from "../types/weather";

export type LoadStage = "locating" | "sky" | "ready";

export interface LoadProgress {
  stage: LoadStage;
  /** 0 -> 1 within the overall sequence. */
  progress: number;
  label: string;
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;

const CACHE_KEY = "tempest:last-weather";
const LAST_CITY_KEY = "tempest:last-city";
const CACHE_MAX_AGE_MS = 15 * 60 * 1000;

export class WeatherError extends Error {
  readonly kind: "no-key" | "denied" | "network" | "not-found";

  constructor(kind: WeatherError["kind"], message: string) {
    super(message);
    this.name = "WeatherError";
    this.kind = kind;
  }
}

const requireKey = () => {
  if (!API_KEY) {
    throw new WeatherError(
      "no-key",
      "Missing VITE_WEATHER_API_KEY. Add it to your .env and restart the dev server.",
    );
  }
  return API_KEY;
};

const current = async (lat: number, lon: number): Promise<WeatherData> => {
  const key = requireKey();
  try {
    const { data } = await axios.get<WeatherData>(
      "https://api.openweathermap.org/data/2.5/weather",
      { params: { lat, lon, appid: key, units: "metric" } },
    );
    return data;
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;
    if (status === 401) {
      throw new WeatherError("no-key", "OpenWeatherMap rejected that API key.");
    }
    throw new WeatherError(
      "network",
      "Couldn't reach the weather service. Check your connection.",
    );
  }
};

export const searchCity = async (query: string): Promise<WeatherData> => {
  const key = requireKey();
  const trimmed = query.trim();
  if (!trimmed) return current(48.8566, 2.3522); // Paris

  try {
    const { data: hits } = await axios.get<Array<{
      name: string;
      lat: number;
      lon: number;
      country: string;
    }>>("https://api.openweathermap.org/geo/1.0/direct", {
      params: { q: trimmed, limit: 1, appid: key },
    });

    if (!hits.length) {
      throw new WeatherError("not-found", `No city called "${trimmed}".`);
    }
    const place = hits[0];
    const weather = await current(place.lat, place.lon);
    localStorage.setItem(LAST_CITY_KEY, place.name);
    return weather;
  } catch (err) {
    if (err instanceof WeatherError) throw err;
    throw new WeatherError("network", "City search failed. Try again.");
  }
};

/**
 * Geolocation that never throws. Denied, unsupported and timed-out all
 * resolve to null so the caller can offer a city picker instead of a
 * white screen.
 */
const tryGeolocation = (): Promise<{ lat: number; lon: number } | null> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  });

export const readCache = (): WeatherData | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: WeatherData };
    if (Date.now() - at > CACHE_MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
};

const writeCache = (data: WeatherData) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* private mode — cache is a nicety, not a requirement */
  }
};

/**
 * Geolocate -> fetch, reporting each stage so the loader can narrate
 * instead of spinning blind.
 */
export const loadWeather = async (
  onProgress: (p: LoadProgress) => void,
): Promise<{ data: WeatherData; located: boolean }> => {
  onProgress({ stage: "locating", progress: 0.1, label: "finding you" });

  const coords = await tryGeolocation();

  if (coords) {
    onProgress({ stage: "sky", progress: 0.55, label: "reading the sky" });
    const data = await current(coords.lat, coords.lon);
    writeCache(data);
    onProgress({ stage: "ready", progress: 1, label: "here it is" });
    return { data, located: true };
  }

  // No location: fall back to wherever they were last time, else Paris.
  const last = localStorage.getItem(LAST_CITY_KEY) || "Paris";
  onProgress({ stage: "sky", progress: 0.55, label: `looking up ${last}` });
  const data = await searchCity(last);
  writeCache(data);
  onProgress({ stage: "ready", progress: 1, label: "here it is" });
  return { data, located: false };
};
