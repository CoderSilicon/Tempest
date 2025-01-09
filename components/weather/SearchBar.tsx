"use client";
import React, { useState } from "react";
import { FaSearch, FaArrowAltCircleRight } from "react-icons/fa";

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
    <div className="flex justify-center items-center my-8">
      <form
        onSubmit={handleSearch}
        className="w-full max-w-md flex items-center space-x-4"
      >
        {/* Input Field */}
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full text-slate-100 bg-transparent border border-slate-600 rounded-3xl py-3 px-5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          placeholder="Search your City"
        />

        {/* Search Button */}
        <button
          type="submit"
          className="p-3 bg-blue-500 text-white hover:bg-blue-600 rounded-full transition-all duration-300 transform hover:scale-110"
        >
          <FaArrowAltCircleRight />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
