import React from "react";
import { FaSun } from "react-icons/fa";
import SecondDiv_W from "@/components/weather/ThirdDiv_W";
import ThirdDiv_W from "@/components/weather/ThirdDiv_W";

const page = () => {
  return (
    <>
      <div className="first-div flex justify-center items-center my-8  ">
        <input
          type="text"
          className="w-[26rem] text-slate-100 bg-transparent border border-slate-600 rounded-lg p-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          placeholder="Search your City"
        />
      </div>
      <SecondDiv_W />
      <ThirdDiv_W />
    </>
  );
};

export default page;
