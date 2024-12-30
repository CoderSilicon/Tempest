import React from "react";
import { FaWind, FaWater, FaEye, FaSun } from "react-icons/fa"; // Importing icons from react-icons

const ThirdDiv_W = () => {
  return (
    <div className="air_conditions lexend-400 mx-4 bg-slate-800 rounded-xl py-8 px-6 shadow-xl">
      <h1 className="text-xl text-gray-500 mb-8  text-center">
        Air Conditions
      </h1>
      <div className="air_conditions_div flex justify-start items-center my-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {/* Wind Condition */}
          <div className="air_conditions_div_1 px-6 py-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <div className="flex justify-start items-center mb-3">
              <FaWind className="text-3xl text-white mr-2" />
              <h2 className="text-xl text-gray-400 font-medium">Wind</h2>
            </div>
            <p className="text-white text-2xl font-semibold">5 km/h</p>
          </div>

          {/* Humidity Condition */}
          <div className="air_conditions_div_1 px-6 py-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <div className="flex justify-start items-center mb-3">
              <FaWater className="text-3xl text-white mr-2" />
              <h2 className="text-xl text-gray-400 font-medium">Humidity</h2>
            </div>
            <p className="text-white text-2xl font-semibold">60%</p>
          </div>

          {/* Visibility Condition */}
          <div className="air_conditions_div_1 px-6 py-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <div className="flex justify-start items-center mb-3">
              <FaEye className="text-3xl text-white mr-2" />
              <h2 className="text-xl text-gray-400 font-medium">Visibility</h2>
            </div>
            <p className="text-white text-2xl font-semibold">10 km</p>
          </div>

          {/* UV Index Condition */}
          <div className="air_conditions_div_1 px-6 py-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <div className="flex justify-start items-center mb-3">
              <FaSun className="text-3xl text-white mr-2" />
              <h2 className="text-xl text-gray-400 font-medium">UV Index</h2>
            </div>
            <p className="text-white text-2xl font-semibold">3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdDiv_W;
