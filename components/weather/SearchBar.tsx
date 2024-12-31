"use client";
import React, { useState } from "react";

type SearchBarProps = {
  onSearch: (city: string) => void;
};

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [city, setCity] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim() !== "") {
      onSearch(city); // Pass the city to the parent (Page component)
    }
  };

  return (
    <div className="first-div flex justify-center items-center my-8">
      <form onSubmit={handleSearch} className="w-full flex justify-center">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-[26rem] text-slate-100 bg-transparent border border-slate-600 rounded-lg p-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          placeholder="Search your City"
        />
        <button
          type="submit"
          className="ml-4 p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
