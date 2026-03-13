import type { WeatherData } from "../types/weather";

export const calculateWeatherScene = (data: WeatherData) => {
  const id = data.weather[0].id;
  const clouds = data.clouds.all;
  
  // DIRECT TIMESTAMP CHECK
  // It is day only if the current time (dt) is between sunrise and sunset
  const isDay = data.dt >= data.sys.sunrise && data.dt < data.sys.sunset;
  const isNight = !isDay;

  // LAYER 1: RAIN
  if (id < 600) {
    if (id >= 200 && id < 300) return { type: "rain", intensity: 3 }; 
    if (id === 502 || id === 503 || id === 504) return { type: "rain", intensity: 3 };
    if (id === 501 || id >= 521) return { type: "rain", intensity: 2 };
    return { type: "rain", intensity: 1 };
  }

  // LAYER 2: FOG/MIST
  if (id >= 700 && id < 800) {
    return { type: "fog", intensity: id === 741 ? 2 : 1, day: isDay };
  }

  // LAYER 3: CLOUDS
  if (id > 800) {
    if (id === 804 || clouds > 80) return { type: "clouds", intensity: 3, day: isDay };
    if (id === 803 || clouds > 50) return { type: "clouds", intensity: 2, day: isDay };
    return { type: "clouds", intensity: 1, day: isDay };
  }

  // LAYER 4: SNOW
  if (id >= 600 && id < 700) {
    return { type: "snow", day: isDay };
  }

  // LAYER 5: CLEAR SKY (ID 800)
  if (id === 800) {
    return { type: "clear", day: isDay };
  }

  // FALLBACK
  return isNight ? { type: "night" } : { type: "day" };
};