"use client";

import React from "react";
import { CiTempHigh } from "react-icons/ci";
import { FaSun, FaWind } from "react-icons/fa";
import { FiDroplet } from "react-icons/fi";
import { MdVisibility } from "react-icons/md";
import { BiBarChart } from "react-icons/bi";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AirConditionsProps = {
  city: string;
};

const uvDescription = (index: number | null) => {
  if (index === null) return "N/A";
  if (index <= 2) return "Low";
  if (index <= 5) return "Moderate";
  if (index <= 7) return "High";
  if (index <= 10) return "Very High";
  return "Extreme";
};

export const AirConditions: React.FC<AirConditionsProps> = ({ city }) => {
  const { weatherData, uvIndex, error, loading } = useWeatherData(city);

  if (loading) {
    return (
      <Card className="mx-auto max-w-4xl my-4">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="h-6 w-1/2 mx-auto bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-4xl my-4 dark:text-slate-100 text-gray-800">
        <CardHeader>
          <CardTitle className="text-center text-secondary">
            Air Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">{error}</div>
          <div className="flex justify-center mt-4">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  const { main, wind, visibility } = weatherData;

  const conditions = [
    {
      label: "Real Feel",
      value: `${main.feels_like.toFixed(1)}°C`,
      icon: <CiTempHigh className="text-3xl" aria-hidden="true" />,
    },
    {
      label: "Wind",
      value: `${wind.speed.toFixed(1)} km/h`,
      icon: <FaWind className="text-3xl" aria-hidden="true" />,
    },
    {
      label: "Humidity",
      value: `${main.humidity}%`,
      icon: <FiDroplet className="text-3xl" aria-hidden="true" />,
    },
    {
      label: "Visibility",
      value: `${(visibility / 1000).toFixed(1)} km`,
      icon: <MdVisibility className="text-3xl" aria-hidden="true" />,
    },
    {
      label: "Pressure",
      value: `${main.pressure} hPa`,
      icon: <BiBarChart className="text-3xl" aria-hidden="true" />,
    },
    {
      label: "UV Index",
      value: `${uvIndex?.toFixed(1) ?? "N/A"} (${uvDescription(uvIndex)})`,
      icon: <FaSun className="text-3xl" aria-hidden="true" />,
    },
  ];

  return (
    <div className="my-6 p-6 rounded-lg bg-gray-100 dark:bg-[#2E3440] text-gray-800 dark:text-[#D8DEE9] border-2 border-slate-800 dark:border-none">
      <div className="text-center text-2xl font-semibold lexend-400 mb-4">
        Air Conditions
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {conditions.map(({ label, value, icon }) => (
          <div
            key={label}
            className="border border-gray-300 dark:border-[#4C566A] rounded-lg p-6 bg-white dark:bg-[#3B4252] transition-transform transform hover:scale-105 hover:shadow-md"
          >
            <div className="flex items-center justify-center mb-4 text-4xl text-primary">
              {icon}
            </div>
            <h2 className="text-lg font-medium text-center">{label}</h2>
            <p className="text-xs font-bold mt-2 text-center text-primary">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
