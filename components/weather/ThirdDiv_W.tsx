"use client";
import React, { useState, useEffect } from "react";
import {
  FaWind,
  FaWater,
  FaEye,
  FaSun,
  FaMoon,
  FaCloudRain,
  FaCloud,
  FaBolt,
  FaSnowflake,
  FaSmog,
} from "react-icons/fa";
import { GiCloudyFork } from "react-icons/gi";
import { IoIosPartlySunny } from "react-icons/io";

type Forecast = {
  dt: number;
  temp: number;
  weather: { icon: string }[];
};

type ThirdDiv_WProps = {
  city: string;
};

const ThirdDiv_W = ({ city }: ThirdDiv_WProps) => {
  const [forecastData, setForecastData] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const simulateHourlyData = (currentTemp: number, weather: any[]) => {
    const simulatedData = [];
    for (let i = 0; i < 8; i++) {
      simulatedData.push({
        dt: Math.floor(Date.now() / 1000) + i * 3600, // Increment by one hour
        temp: currentTemp + (Math.random() * 2 - 1), // Random temp fluctuation
        weather,
      });
    }
    return simulatedData;
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!city) {
        setError("City is required to fetch weather data");
        setLoading(false);
        return;
      }

      setLoading(true); // Reset loading state before each fetch
      setError(""); // Clear any previous errors

      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY; // Replace with your actual API key
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

      try {
        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (data.cod !== 200) {
          setError("City not found or forecast data unavailable.");
          setLoading(false);
          return;
        }

        const currentTemp = data.main.temp;
        const weather = data.weather;

        // Simulate hourly data
        const simulatedForecastData = simulateHourlyData(currentTemp, weather);
        setForecastData(simulatedForecastData);
      } catch (err) {
        setError("Error fetching weather data.");
        console.error("Error fetching weather data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data when city changes
    fetchWeatherData();
  }, [city]); // Re-run the fetch whenever the city changes

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case "01d":
        return <FaSun className="text-3xl text-yellow-500" />;
      case "01n":
        return <FaMoon className="text-3xl text-blue-500" />;
      case "02d":
      case "02n":
        return <IoIosPartlySunny className="text-3xl text-gray-500" />;
      case "03d":
      case "03n":
        return <GiCloudyFork className="text-3xl text-gray-600" />;
      case "04d":
      case "04n":
        return <FaCloud className="text-3xl text-gray-700" />;
      case "09d":
      case "09n":
        return <FaCloudRain className="text-3xl text-blue-500" />;
      case "10d":
        return <FaCloudRain className="text-3xl text-yellow-500" />;
      case "10n":
        return <FaCloudRain className="text-3xl text-blue-700" />;
      case "11d":
      case "11n":
        return <FaBolt className="text-3xl text-gray-800" />;
      case "13d":
      case "13n":
        return <FaSnowflake className="text-3xl text-white" />;
      case "50d":
      case "50n":
        return <FaSmog className="text-3xl text-gray-400" />;
      default:
        return <FaCloud className="text-3xl text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse mx-4 bg-gray-700 dark:bg-gray-800 rounded-xl p-10 my-4 shadow-xl">
        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-auto mb-4"></div>
        <div className="flex justify-center items-center my-8">
          <div className="h-6 bg-gray-600 dark:bg-gray-500 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 bg-gray-700 dark:bg-gray-800 rounded-xl py-8 px-6 my-4 shadow-xl">
        <h1 className="text-xl text-gray-500 dark:text-gray-400 mb-8 text-center">
          Today's Forecast
        </h1>
        <div className="flex justify-center items-center my-8">
          <h1 className="text-xl text-red-500 dark:text-red-400 mb-8 text-center">
            {error}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 bg-white dark:bg-gray-800 rounded-xl py-8 px-6 my-4 shadow-xl border-2 border-slate-800 dark:border-none">
      <h1 className="text-xl text-gray-800 dark:text-white mb-8 text-center">
        Today's Forecast
      </h1>
      <div className="flex justify-center gap-4 flex-wrap sm:flex-nowrap items-center my-8">
        <div className="flex flex-col w-full sm:w-auto">
          {forecastData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:grid-cols-4">
              {forecastData.map((hour, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-center items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-4 border border-gray-300 dark:border-gray-600 shadow-md"
                >
                  {getWeatherIcon(hour.weather[0].icon)}
                  <span className="text-gray-800 dark:text-white font-medium text-xs sm:text-sm">
                    {new Date(hour.dt * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-gray-800 dark:text-white font-semibold text-xs sm:text-base">
                    {hour.temp.toFixed(1)}°C
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-800 dark:text-white">
              No forecast data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThirdDiv_W;
