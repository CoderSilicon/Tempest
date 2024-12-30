import React from "react";
import { FaSun } from "react-icons/fa";

const SecondDiv_W = () => {
  return (
    <div className="sec-div text-center flex  justify-around items-center lexend-400 my-8">
      <div className="heading text-white text-left ">
        <h2 className="text-4xl">Delhi</h2>
        <p className="text-gray-700">Chance of rain: 0%</p>
        <h1 className="text-6xl my-6">31°</h1>
      </div>
      <div className="image">
        <FaSun className="text-yellow-400 text-9xl" />
      </div>
    </div>
  );
};

export default SecondDiv_W;
