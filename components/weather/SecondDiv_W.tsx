"use client";
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

      const API_KEY = "2daa05ca17a2397c080aa2108cd93243"; // Replace with your actual API key
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
        return <FaSun className="text-yellow-400 text-9xl" />;
      case "01n":
        return <FaMoon className="text-blue-400 text-9xl" />;
      case "02d":
      case "02n":
        return <FaCloud className="text-gray-500 text-9xl" />;
      case "09d":
      case "09n":
        return <FaCloudRain className="text-blue-500 text-9xl" />;
      default:
        return <FaCloud className="text-gray-500 text-9xl" />;
    }
  };

  return (
    <div className="sec-div text-center flex justify-around items-center lexend-400 my-8">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="heading text-white text-left">
            <h2 className="text-4xl">{city}</h2>
            <p className="text-gray-700">Chance of rain: {rainChance}%</p>
            <h1 className="text-6xl my-6">{temperature}°</h1>
          </div>
          <div className="image">{getWeatherIcon(weatherIcon)}</div>
        </>
      )}
    </div>
  );
};

export default SecondDiv_W;
