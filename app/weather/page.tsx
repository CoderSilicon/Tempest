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
    <div>
      <SearchBar onSearch={setCity} />
      {city && (
        <>
          {" "}
          <SecondDiv_W city={city} />
          <SixthDiv_W city={city} />
          <ThirdDiv_W city={city} />
          <FourthDiv_W city={city} />
          <FifthDiv_W city={city} />
        </>
      )}
    </div>
  );
};

export default Page;
