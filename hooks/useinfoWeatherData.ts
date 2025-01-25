import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  rainChance: number;
  weatherIcon: string;
  city: string;
}

export const useWeatherData = (city: string) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!city) return;

      setLoading(true);
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        setError("API key is not defined");
        setLoading(false);
        return;
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
          setError("City not found. Please try again.");
          setLoading(false);
          return;
        }

        setWeatherData({
          temperature: data.main.temp,
          rainChance: data.rain ? data.rain["1h"] : 0,
          weatherIcon: data.weather[0].icon,
          city: data.name,
        });
        setError(null);
      } catch (error) {
        setError("Error fetching weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);

  return { weatherData, error, loading };
};
