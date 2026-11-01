import type { WeatherData } from "../types/weather";

export type SceneType =
  | "clear"
  | "day"
  | "night"
  | "clouds"
  | "rain"
  | "snow"
  | "fog";

export interface Scene {
  type: SceneType;
  /** 1 = light, 2 = moderate, 3 = heavy. */
  intensity: number;
  day: boolean;
}

/**
 * Maps an OpenWeather condition code onto a visual scene.
 *
 * `data.dt` is the moment the observation was taken, so comparing it
 * against sunrise/sunset (both in the same local offset) gives a correct
 * day/night answer for the place, not the viewer's clock.
 */
export const calculateWeatherScene = (data: WeatherData): Scene => {
  const id = data.weather[0].id;
  const clouds = data.clouds.all;
  const day = data.dt >= data.sys.sunrise && data.dt < data.sys.sunset;

  // 2xx thunderstorm -> heaviest rain tier
  if (id >= 200 && id < 300) {
    return { type: "rain", intensity: 3, day };
  }

  // 3xx / 5xx drizzle & rain
  if ((id >= 300 && id < 400) || (id >= 500 && id < 600)) {
    if (id === 502 || id === 503 || id === 504 || id === 522) {
      return { type: "rain", intensity: 3, day };
    }
    if (id === 501 || id === 521 || id === 531) {
      return { type: "rain", intensity: 2, day };
    }
    return { type: "rain", intensity: 1, day };
  }

  // 6xx snow
  if (id >= 600 && id < 700) {
    return { type: "snow", intensity: id >= 620 ? 3 : 2, day };
  }

  // 7xx atmosphere: mist / fog / haze / squalls
  if (id >= 700 && id < 800) {
    return { type: "fog", intensity: id >= 741 ? 2 : 1, day };
  }

  // 800 clear
  if (id === 800) return { type: "clear", intensity: 1, day };

  // 80x clouds
  if (id > 800) {
    if (id === 804 || clouds > 80) return { type: "clouds", intensity: 3, day };
    if (id === 803 || clouds > 50) return { type: "clouds", intensity: 2, day };
    return { type: "clouds", intensity: 1, day };
  }

  return { type: day ? "day" : "night", intensity: 1, day };
};
