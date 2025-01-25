"use client";
import React, { useState } from "react";
import SearchBar from "@/components/weather/SearchBar";
import { AirConditions } from "@/components/weather/AirConditions";
import ThirdDiv_W from "@/components/weather/ThirdDiv_W";
import SixthDiv_W from "@/components/weather/SixthDiv_W";
import { WeatherDisplay } from "@/components/weather/WeatherDisplay";
import { ForecastDisplay } from "@/components/weather/ForecastDisplay";

const Page = () => {
  const [city, setCity] = useState<string>("");

  return (
    <div className=" lexend-400">
      <SearchBar onSearch={setCity} />
      {city && (
        <>
          <WeatherDisplay city={city} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
            <SixthDiv_W city={city} />
            <ThirdDiv_W city={city} />
            <AirConditions city={city} />
            <ForecastDisplay city={city} />
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
