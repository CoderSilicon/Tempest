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

      const API_KEY = "2daa05ca17a2397c080aa2108cd93243"; // Replace with your actual API key
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
        return <FaSun className="text-3xl text-yellow-500" />; // Clear sky during the day
      case "01n":
        return <FaMoon className="text-3xl text-blue-500" />; // Clear sky at night
      case "02d":
      case "02n":
        return <IoIosPartlySunny className="text-3xl text-gray-500" />; // Partly cloudy
      case "03d":
      case "03n":
        return <GiCloudyFork className="text-3xl text-gray-600" />; // Cloudy
      case "04d":
      case "04n":
        return <FaCloud className="text-3xl text-gray-700" />; // Overcast
      case "09d":
      case "09n":
        return <FaCloudRain className="text-3xl text-blue-500" />; // Showers
      case "10d":
        return <FaCloudRain className="text-3xl text-yellow-500" />; // Rain (day)
      case "10n":
        return <FaCloudRain className="text-3xl text-blue-700" />; // Rain (night)
      case "11d":
      case "11n":
        return <FaBolt className="text-3xl text-gray-800" />; // Thunderstorm
      case "13d":
      case "13n":
        return <FaSnowflake className="text-3xl text-white" />; // Snow
      case "50d":
      case "50n":
        return <FaSmog className="text-3xl text-gray-400" />; // Mist/Fog
      default:
        return <FaCloud className="text-3xl text-gray-500" />; // Default cloudy icon
    }
  };

  if (loading) {
    return (
      <div className="air_conditions lexend-400 mx-4 bg-slate-800 rounded-xl py-8 px-6 my-4 shadow-xl">
        <h1 className="text-xl text-gray-500 mb-8 text-center">
          Today's Forecast
        </h1>
        <div className="air_conditions_div flex justify-center items-center my-8">
          <h1 className="text-xl text-slate-200 mb-8 text-center">{loading}</h1>
        </div>
      </div>
    ); // Show loading message
  }

  if (error) {
    return (
      <div className="air_conditions lexend-400 mx-4 bg-slate-800 rounded-xl py-8 px-6 my-4 shadow-xl">
        <h1 className="text-xl text-gray-500 mb-8 text-center">
          Today's Forecast
        </h1>
        <div className="air_conditions_div flex justify-center items-center my-8">
          <h1 className="text-xl text-red-500 mb-8 text-center">{error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="air_conditions lexend-400 mx-4 bg-slate-800 rounded-xl py-8 px-6 my-4 shadow-xl">
      <h1 className="text-xl text-gray-500 mb-8 text-center">
        Today's Forecast
      </h1>
      <div className="forecast_div flex justify-center gap-8 items-center my-8">
        <div>
          {forecastData.length > 0 ? (
            <div className="forecast flex overflow-x-auto">
              {forecastData.map((hour, index) => (
                <div
                  key={index}
                  className="forecast_item flex flex-col justify-center items-center border-l-2 border-gray-200 px-4 py-6 first:border-l-0"
                >
                  {getWeatherIcon(hour.weather[0].icon)}
                  <span className="time text-gray-600 font-medium">
                    {new Date(hour.dt * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="temp text-slate-200 font-semibold">
                    {hour.temp.toFixed(1)}°C
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No forecast data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThirdDiv_W;
