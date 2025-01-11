"use client";
import React, { useState } from "react";
import SearchBar from "@/components/weather/SearchBar";
import { FourthDiv_W } from "@/components/weather/FourthDiv_W";
import SecondDiv_W from "@/components/weather/SecondDiv_W";
import ThirdDiv_W from "@/components/weather/ThirdDiv_W";
import FifthDiv_W from "@/components/weather/FifthDiv_W";
import SixthDiv_W from "@/components/weather/SixthDiv_W";

const Page = () => {
  const [city, setCity] = useState<string>("");

  return (
    <div className=" min-h-screen  bg-gradient-to-br from-polar-night to-polar-night-lighter text-snow-storm">
      <SearchBar onSearch={setCity} />
      {city && (
        <>
          <SecondDiv_W city={city} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
            <SixthDiv_W city={city} />
            <ThirdDiv_W city={city} />
            <FourthDiv_W city={city} />
            <FifthDiv_W city={city} />
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
