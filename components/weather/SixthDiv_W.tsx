"use client";
import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

type SunriseSunsetProps = {
  city: string;
};

const SixthDiv_W = ({ city }: SunriseSunsetProps) => {
  const [sunrise, setSunrise] = useState<string>("");
  const [sunset, setSunset] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchSunriseSunsetData = async () => {
      if (!city) {
        setError("City is required to fetch sunrise and sunset data");
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
          setError("City not found or sunrise/sunset data unavailable.");
          setLoading(false);
          return;
        }

        const sunriseTime = new Date(
          data.sys.sunrise * 1000
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        setSunrise(sunriseTime);
        setSunset(sunsetTime);
      } catch (err) {
        setError("Error fetching sunrise and sunset data.");
        console.error("Error fetching sunrise and sunset data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSunriseSunsetData();
  }, [city]);

  if (loading) {
    return (
      <div className="animate-pulse lexend-400 mx-4 bg-slate-800 rounded-xl p-10 my-4 shadow-xl">
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
        <div className="flex justify-center items-center my-8">
          <div className="h-6 bg-slate-600 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sunrise_sunset lexend-400 mx-4 bg-slate-800 rounded-xl p-10 my-4 shadow-xl">
        <h1 className="text-xl text-gray-500 mb-8 text-center">
          Sunrise & Sunset
        </h1>
        <div className="error_div flex justify-center items-center my-8">
          <h1 className="text-xl text-red-500 mb-8 text-center">{error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="sunrise_sunset lexend-400 mx-4 bg-gradient-to-r from-gray-950 via-slate-950 to-gray-950 rounded-xl p-10 my-4 shadow-xl">
      <h1 className="text-xl text-white mb-8 text-center font-bold">
        Sunrise & Sunset
      </h1>
      <div className="sun_times flex flex-wrap justify-around items-center gap-8">
        <div className="sunrise flex flex-col items-center animate-sunrise gap-4">
          <FaSun className="text-4xl text-yellow-400 animate-pulse" />
          <span className="time text-white font-semibold text-lg sm:text-xl">
            Sunrise: {sunrise}
          </span>
        </div>
        <div className="sunset flex flex-col items-center animate-sunset gap-4">
          <FaMoon className="text-4xl text-blue-400 animate-fadeIn" />
          <span className="time text-white font-semibold text-lg sm:text-xl">
            Sunset: {sunset}
          </span>
        </div>
      </div>
      <div className="info-box text-center mt-8">
        <p className="text-white text-sm sm:text-base opacity-80">
          The times are based on the provided city's local time zone. Enjoy the
          view!
        </p>
      </div>
    </div>
  );
};

export default SixthDiv_W;
