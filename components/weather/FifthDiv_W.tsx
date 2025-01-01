"use client";
import React, { useEffect, useState } from "react";

type FifthDivProps = {
  city: string;
};

interface ForecastData {
  day: string;
  icon: string;
  temp_max: number;
  temp_min: number;
  description: string;
}

const FifthDiv_W: React.FC<FifthDivProps> = ({ city }) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getWeatherIcon = (icon: string): React.ReactNode => (
    <img
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      alt="Weather Icon"
      className="w-10 h-10 sm:w-12 sm:h-12"
    />
  );

  const fetchForecast = async (city: string): Promise<void> => {
    const apiKey = "1bdb17e1817de952da5326b91c048d53";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();
      setLoading(false);

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

        setForecastData(groupedData.slice(0, 5)); // Limit to 5 days
        setError(null);
      } else {
        setError(data.message || "City not found.");
      }
    } catch (err) {
      setLoading(false);
      setError("Unable to fetch weather data. Please try again.");
    }
  };

  useEffect(() => {
    if (city) {
      fetchForecast(city);
    }
  }, [city]);

  if (loading) {
    return <p className="text-center text-gray-300">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="forecast-container lexend-400 mx-2 sm:mx-4">
      <div className="air_conditions bg-slate-800 rounded-xl py-4 sm:py-8 px-4 sm:px-6 my-4 shadow-xl">
        <h1 className="text-lg sm:text-xl text-gray-500 mb-6 sm:mb-8 text-center">
          5-Day Forecast
        </h1>
        {forecastData.length > 0 && (
          <div className="forecast flex flex-col gap-4 sm:gap-6">
            {forecastData.map((day, index) => (
              <div
                key={index}
                className="forecast_item flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 sm:gap-4 border-b border-gray-700 pb-4 last:border-b-0"
              >
                <div className="day text-gray-300 font-bold flex-1 text-center text-sm sm:text-base">
                  {day.day}
                </div>
                <div className="icon flex-1 flex justify-center">
                  {getWeatherIcon(day.icon)}
                </div>
                <div className="temp text-slate-200 font-semibold flex-1 text-center text-sm sm:text-base">
                  {day.temp_max.toFixed(1)}°C / {day.temp_min.toFixed(1)}°C
                </div>
                <div className="description text-slate-400 flex-1 text-center text-xs sm:text-sm">
                  {day.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FifthDiv_W;
