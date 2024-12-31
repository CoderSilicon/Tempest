"use client";
import React, { useState, useEffect } from "react";
import { CiTempHigh } from "react-icons/ci";
import { FaSun, FaWind } from "react-icons/fa";
import { FiDroplet } from "react-icons/fi";

type FourthDiv_WProps = {
  city: string;
};

export const FourthDiv_W = ({ city }: FourthDiv_WProps) => {
  const [weatherData, setWeatherData] = useState<any>(null); // Store weather data
  const [uvIndex, setUvIndex] = useState<number | null>(null); // Store UV index
  const [error, setError] = useState<string>(""); // Error handling
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!city) return;

      setLoading(true); // Start loading state

      try {
        const API_KEY = "2daa05ca17a2397c080aa2108cd93243"; // Replace with your actual API key

        // Fetch current weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
          setError("Air Conditions of the city is not available.");
          setLoading(false);
          return;
        }

        // Fetch UV Index data
        const { lat, lon } = weatherData.coord;
        const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const uvResponse = await fetch(uvUrl);
        const uvData = await uvResponse.json();

        setWeatherData(weatherData);
        setUvIndex(uvData.value);
        setError(""); // Clear any previous error
        setLoading(false); // Stop loading
      } catch (error) {
        setError("Error fetching weather data.");
        setLoading(false); // Stop loading
      }
    };

    if (city) {
      fetchWeatherData(); // Trigger data fetch if city is available
    }
  }, [city]); // Re-fetch if the city changes

  if (loading) {
    return (
      <div className="air_conditions lexend-400 mx-4 bg-slate-800 rounded-xl py-8 px-6 my-4 shadow-xl">
        <h1 className="text-xl text-gray-500 mb-8 text-center">
          Air Conditions
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
          Air Conditions
        </h1>
        <div className="air_conditions_div flex justify-center items-center my-8">
          <h1 className="text-xl text-red-500 mb-8 text-center">{error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="air_conditions lexend-400 mx-4 bg-slate-800 rounded-xl py-8 px-6 my-4 shadow-xl">
      <h1 className="text-xl text-gray-500 mb-8 text-center">Air Conditions</h1>
      <div className="air_conditions_div flex justify-start items-center my-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          <div className="air_conditions_div_1 px-6 py-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <div className="flex justify-start items-center mb-3">
              <CiTempHigh className="text-3xl text-white mr-2" />
              <h2 className="text-xl text-gray-400 font-medium">Real Feel</h2>
            </div>
            <p className="text-white text-2xl font-semibold">
              {weatherData?.main.feels_like}°C
            </p>
          </div>

          <div className="air_conditions_div_1 px-6 py-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <div className="flex justify-start items-center mb-3">
              <FaWind className="text-3xl text-white mr-2" />
              <h2 className="text-xl text-gray-400 font-medium">Wind</h2>
            </div>
            <p className="text-white text-2xl font-semibold">
              {weatherData?.wind.speed} km/h
            </p>
          </div>

          <div className="air_conditions_div_1 px-6 py-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <div className="flex justify-start items-center mb-3">
              <FiDroplet className="text-3xl text-white mr-2" />
              <h2 className="text-xl text-gray-400 font-medium">Humidity</h2>
            </div>
            <p className="text-white text-2xl font-semibold">
              {weatherData?.main.humidity}%
            </p>
          </div>

          {/* UV Index Condition */}
          <div className="air_conditions_div_1 px-6 py-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <div className="flex justify-start items-center mb-3">
              <FaSun className="text-3xl text-white mr-2" />
              <h2 className="text-xl text-gray-400 font-medium">UV Index</h2>
            </div>
            <p className="text-white text-2xl font-semibold">{uvIndex}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
