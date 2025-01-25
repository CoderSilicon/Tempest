import { useState, useEffect } from "react";

export interface ForecastData {
  day: string;
  icon: string;
  temp_max: number;
  temp_min: number;
  description: string;
}

export const useForecastData = (city: string) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchForecast = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        setError("API key is not defined");
        return;
      }

      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&units=metric&appid=${apiKey}`;

      try {
        setLoading(true);
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === "200") {
          const groupedData: ForecastData[] = [];
          const seenDays = new Set<string>();

          data.list.forEach((item: any) => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString("en-US", { weekday: "long" });

            if (!seenDays.has(day)) {
              seenDays.add(day);
              groupedData.push({
                day,
                icon: item.weather[0].icon,
                temp_max: item.main.temp_max,
                temp_min: item.main.temp_min,
                description: item.weather[0].description,
              });
            }
          });

          setForecastData(groupedData.slice(0, 4)); // Limit to 4 days for 2x2 grid
          setError(null);
        } else {
          setError(data.message || "City not found.");
        }
      } catch (err) {
        setError("Unable to fetch weather data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchForecast();
    }
  }, [city]);

  return { forecastData, error, loading };
};
