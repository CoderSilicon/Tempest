"use client";
import { div } from "framer-motion/client";
import React, { useState, useEffect } from "react";
import { FaCloud, FaCloudRain, FaMoon, FaSun } from "react-icons/fa";

type SecondDiv_WProps = {
  city: string;
};

const SecondDiv_W = ({ city }: SecondDiv_WProps) => {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [rainChance, setRainChance] = useState<number>(0);
  const [weatherIcon, setWeatherIcon] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!city) return;

      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY; // Replace with your actual API key
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
          setError("City not found. Please try again.");
          return;
        }

        // Extract data from API response
        setTemperature(data.main.temp);
        setWeatherIcon(data.weather[0].icon);
        setRainChance(data.rain ? data.rain["1h"] : 0);
        setError(""); // Clear any previous errors
      } catch (error) {
        setError("Error fetching weather data.");
      }
    };

    fetchWeatherData();
  }, [city]); // Trigger the API call when city changes

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case "01d":
        return <FaSun className="text-yellow-400 text-7xl sm:text-9xl" />;
      case "01n":
        return <FaMoon className="text-blue-400 text-7xl sm:text-9xl" />;
      case "02d":
      case "02n":
        return <FaCloud className="text-gray-500 text-7xl sm:text-9xl" />;
      case "09d":
      case "09n":
        return <FaCloudRain className="text-blue-500 text-7xl sm:text-9xl" />;
      default:
        return <FaCloud className="text-gray-500 text-7xl sm:text-9xl" />;
    }
  };

  return (
    <div className="main flex justify-center items-center lg:justify-around lg:items-start p-4 w-full">
      <div className="sec-div flex flex-col sm:flex-row justify-center sm:justify-between lg:justify-around items-center lg:items-start text-center sm:text-left lexend-400 my-4 sm:my-8 p-4 w-full">
        {error ? (
          <div className="text-red-500 text-sm sm:text-base">{error}</div>
        ) : (
          <>
            <div className="heading text-white mb-4 sm:mb-0 w-full sm:w-auto">
              <h2 className="text-2xl sm:text-4xl">{city}</h2>
              <p className="text-gray-400 text-sm sm:text-base mt-2 sm:mt-0">
                Chance of rain: {rainChance}%
              </p>
              <h1 className="text-4xl sm:text-6xl my-4 sm:my-6">
                {temperature}°
              </h1>
            </div>
            <div className="image flex justify-center items-center mt-4 sm:mt-0 lg:ml-4 w-full sm:w-auto">
              {getWeatherIcon(weatherIcon)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecondDiv_W;
