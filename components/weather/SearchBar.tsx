"use client";
import React, { useState } from "react";
import { FaArrowAltCircleRight } from "react-icons/fa";

type SearchBarProps = {
  onSearch: (city: string) => void;
};

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [city, setCity] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (city.trim() === "") {
      setError("Please enter a city name.");
    } else {
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/name/${city}?fullText=true`
        );
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setError("City is a valid country name.");
        } else {
          onSearch(city);
        }
      } catch {
        setError("Failed to validate the city name. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center  sm:px-6 lg:px-8">
      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl flex items-center space-x-4 bg-nord p-4 rounded-2xl  shadow-lg"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full text-nord2 bg-transparent border border-nord3 rounded-lg py-3 px-5 placeholder:text-nord4 focus:outline-none focus:ring-2 focus:ring-nord5 transition-all duration-300"
          placeholder="Enter your City"
        />
        <button
          type="submit"
          className="p-3 bg-nord6 text-nord0 rounded-full hover:bg-nord7 transition-all duration-300 transform hover:scale-110"
          disabled={loading}
        >
          <FaArrowAltCircleRight />
        </button>
      </form>
      {error && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setError(null)}
        >
          <div className="bg-nord8 text-white p-4 rounded-lg shadow-lg">
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
