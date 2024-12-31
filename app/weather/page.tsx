"use client";
import React, { useState } from "react";

import SearchBar from "@/components/weather/SearchBar";
import { FourthDiv_W } from "@/components/weather/FourthDiv_W";
import SecondDiv_W from "@/components/weather/SecondDiv_W";
import ThirdDiv_W from "@/components/weather/ThirdDiv_W";

const Page = () => {
  const [city, setCity] = useState<string>(""); // To track the city input

  const handleCitySearch = (searchedCity: string) => {
    setCity(searchedCity); // Set the city when the search is triggered
  };

  return (
    <div>
      <SearchBar onSearch={handleCitySearch} />{" "}
      {/* Pass city update function */}
      {city && <SecondDiv_W city={city} />} {city && <ThirdDiv_W city={city} />}{" "}
      {city && <FourthDiv_W city={city} />}{" "}
      {/* Display weather data if a city is searched */}
    </div>
  );
};

export default Page;
