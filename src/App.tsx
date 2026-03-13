import { createResource, Show } from "solid-js";
import axios from "axios";
import { WeatherMain } from "./components/Weather";
import { Loader } from "./components/Loader";

const getLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
};
// 1. Define the fetcher function
const fetchWeather = async () => {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || null;
  const { lat, lon } = await getLocation();
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const response = await axios.get(url);
  return response.data;
};

export default function Home() {
  const [weatherData] = createResource(fetchWeather);

  return (
    <Show
      when={!weatherData.loading}
      fallback={
        // <div class="flex bg-black text-white items-center justify-center h-screen">
        //   <p class="text-2xl">Fetching weather data...</p>
        // </div>

        <Loader />
      }
    >
      <WeatherMain data={weatherData()} />
    </Show>
  );
}
