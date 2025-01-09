"use client";
import React, { useState, useEffect } from "react";
import { CiTempHigh } from "react-icons/ci";
import { FaSun, FaWind } from "react-icons/fa";
import { FiDroplet } from "react-icons/fi";
import { MdVisibility } from "react-icons/md";
import { BiBarChart } from "react-icons/bi";

type FourthDiv_WProps = {
  city: string;
};

export const FourthDiv_W = ({ city }: FourthDiv_WProps) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!city) return;

      setLoading(true);

      try {
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
          setError("Air Conditions of the city are not available.");
          setLoading(false);
          return;
        }

        const { lat, lon } = weatherData.coord;
        const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const uvResponse = await fetch(uvUrl);
        const uvData = await uvResponse.json();

        setWeatherData(weatherData);
        setUvIndex(uvData.value);
        setError("");
        setLoading(false);
      } catch (error) {
        setError("Error fetching weather data.");
        setLoading(false);
      }
    };

    if (city) fetchWeatherData();
  }, [city]);

  const uvDescription = (index: number | null) => {
    if (index === null) return "N/A";
    if (index <= 2) return "Low";
    if (index <= 5) return "Moderate";
    if (index <= 7) return "High";
    if (index <= 10) return "Very High";
    return "Extreme";
  };

  const nordColors = {
    bg: "#2E3440",
    cardBg: "#3B4252",
    hoverBg: "#434C5E",
    textPrimary: "#D8DEE9",
    textSecondary: "#A3BE8C",
    error: "#BF616A",
    highlight: "#88C0D0",
  };

  if (loading) {
    return (
      <div
        className="animate-pulse lexend-400 mx-4 rounded-xl p-10 my-4 shadow-xl"
        style={{ backgroundColor: nordColors.bg }}
      >
        <div
          className="h-6 rounded w-1/2 mx-auto mb-4"
          style={{ backgroundColor: nordColors.cardBg }}
        ></div>
        <div
          className="h-32 rounded mx-auto"
          style={{ backgroundColor: nordColors.hoverBg }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="air_conditions lexend-400 mx-4 rounded-xl py-8 px-6 my-4 shadow-xl"
        style={{ backgroundColor: nordColors.bg }}
      >
        <h1
          className="text-xl mb-8 text-center"
          style={{ color: nordColors.textSecondary }}
        >
          Air Conditions
        </h1>
        <div className="text-center" style={{ color: nordColors.error }}>
          {error}
        </div>
        <button
          onClick={() => setError("")}
          className="mt-4 px-4 py-2 rounded hover:opacity-90"
          style={{
            backgroundColor: nordColors.highlight,
            color: nordColors.bg,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const { main, wind, visibility } = weatherData || {};

  return (
    <div
      className="air_conditions lexend-400 mx-4 rounded-xl py-8 px-6 my-4 shadow-xl"
      style={{ backgroundColor: nordColors.bg }}
    >
      <h1
        className="text-xl mb-8 text-center"
        style={{ color: nordColors.textSecondary }}
      >
        Air Conditions
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            label: "Real Feel",
            value: `${main?.feels_like}°C`,
            icon: <CiTempHigh className="text-3xl" />,
          },
          {
            label: "Wind",
            value: `${wind?.speed} km/h`,
            icon: <FaWind className="text-3xl" />,
          },
          {
            label: "Humidity",
            value: `${main?.humidity}%`,
            icon: <FiDroplet className="text-3xl" />,
          },
          {
            label: "Visibility",
            value: `${visibility / 1000} km`,
            icon: <MdVisibility className="text-3xl" />,
          },
          {
            label: "Pressure",
            value: `${main?.pressure} hPa`,
            icon: <BiBarChart className="text-3xl" />,
          },
          {
            label: "UV Index",
            value: `${uvIndex} (${uvDescription(uvIndex)})`,
            icon: <FaSun className="text-3xl" />,
          },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="px-6 py-4 rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: nordColors.cardBg }}
          >
            <div className="mb-2" style={{ color: nordColors.textPrimary }}>
              {icon}
            </div>
            <h2 className="text-xl" style={{ color: nordColors.textSecondary }}>
              {label}
            </h2>
            <p className="text-2xl" style={{ color: nordColors.textPrimary }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
