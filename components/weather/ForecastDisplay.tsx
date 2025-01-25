"use client";

import type React from "react";
import { useForecastData, type ForecastData } from "@/hooks/useForecastData";

interface ForecastDisplayProps {
  city: string;
}

const WeatherIcon: React.FC<{ icon: string }> = ({ icon }) => (
  <img
    src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
    alt="Weather Icon"
    className="w-12 h-12"
    loading="lazy"
  />
);

const ForecastCard: React.FC<ForecastData> = ({
  day,
  icon,
  temp_max,
  temp_min,
  description,
}) => (
  <div className="flex flex-col items-center p-4 bg-white dark:bg-[#3B4252] rounded-lg shadow-lg transition-transform hover:scale-105">
    <span className="font-medium text-center text-gray-800 dark:text-white">
      {day}
    </span>
    <WeatherIcon icon={icon} />
    <span className="text-center font-semibold text-gray-900 dark:text-white">
      {temp_max.toFixed(1)}°C / {temp_min.toFixed(1)}°C
    </span>
    <span className="text-center text-sm text-gray-900 dark:text-white">
      {description}
    </span>
  </div>
);

export const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ city }) => {
  const { forecastData, error, loading } = useForecastData(city);

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-[#2E3440] text-gray-800 dark:text-[#D8DEE9] rounded-lg p-6 shadow-lg animate-pulse border-2 border-slate-800 dark:border-none">
        <div className="h-6 bg-gray-300 dark:bg-[#4C566A] rounded w-1/2 mx-auto mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-32 bg-gray-300 dark:bg-[#4C566A] rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 dark:bg-[#2E3440] text-gray-800 dark:text-[#D8DEE9] rounded-lg p-6 shadow-lg">
        <h1 className="font-semibold mb-6 text-center text-blue-600 dark:text-[#81A1C1] text-xl">
          4-Day Forecast
        </h1>
        <p className="text-center text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-[#2E3440] text-gray-800 dark:text-[#D8DEE9] rounded-lg p-6 shadow-lg border-2 border-slate-800 dark:border-none">
      <h1 className="lexend-400 text-blue-600 dark:text-[#81A1C1] text-xl mb-8 text-center">
        4-Day Forecast
      </h1>
      {forecastData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {forecastData.map((day, index) => (
            <ForecastCard key={index} {...day} />
          ))}
        </div>
      )}
    </div>
  );
};
