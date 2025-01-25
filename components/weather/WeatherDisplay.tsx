"use client";

import React from "react";
import { FaCloud, FaCloudRain, FaMoon, FaSun } from "react-icons/fa";
import { useWeatherData } from "@/hooks/useinfoWeatherData";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherDisplayProps {
  city: string;
}

const WeatherIcon: React.FC<{ iconCode: string }> = ({ iconCode }) => {
  const iconMap = {
    "01d": <FaSun className="text-yellow-400 text-7xl sm:text-9xl" />,
    "01n": <FaMoon className="text-blue-400 text-7xl sm:text-9xl" />,
    "02d": <FaCloud className="text-gray-500 text-7xl sm:text-9xl" />,
    "02n": <FaCloud className="text-gray-500 text-7xl sm:text-9xl" />,
    "09d": <FaCloudRain className="text-blue-500 text-7xl sm:text-9xl" />,
    "09n": <FaCloudRain className="text-blue-500 text-7xl sm:text-9xl" />,
  };

  return (
    iconMap[iconCode as keyof typeof iconMap] || (
      <FaCloud className="text-gray-500 text-7xl sm:text-9xl" />
    )
  );
};

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ city }) => {
  const { weatherData, error, loading } = useWeatherData(city);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="w-full sm:w-2/3">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-16 w-1/3" />
            </div>
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-red-500 text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  return (
    <Card className="w-full max-w-md mx-auto ">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-4xl font-semibold">
              {weatherData.city}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">
              Chance of rain: {weatherData.rainChance}%
            </p>
            <h1 className="text-4xl sm:text-6xl font-bold my-4 sm:my-6">
              {weatherData.temperature.toFixed(1)}°C
            </h1>
          </div>
          <div className="flex justify-center items-center">
            <WeatherIcon iconCode={weatherData.weatherIcon} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
