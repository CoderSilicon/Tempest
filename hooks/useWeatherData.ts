import { useState, useEffect } from "react";

type WeatherData = {
  main: {
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  visibility: number;
};

type UVData = {
  value: number;
};

export const useWeatherData = (city: string) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!city) return;

      setLoading(true);

      try {
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!API_KEY) {
          throw new Error("API key is not defined");
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData: WeatherData & {
          cod: number;
          coord: { lat: number; lon: number };
        } = await weatherResponse.json();

        if (weatherData.cod !== 200) {
          throw new Error("Air Conditions of the city are not available.");
        }

        const { lat, lon } = weatherData.coord;
        const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const uvResponse = await fetch(uvUrl);
        const uvData: UVData = await uvResponse.json();

        setWeatherData(weatherData);
        setUvIndex(uvData.value);
        setError("");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error fetching weather data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (city) fetchWeatherData();
  }, [city]);

  return { weatherData, uvIndex, error, loading };
};
