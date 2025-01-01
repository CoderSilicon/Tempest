"use client";
import Link from "next/link";
import React, { useState } from "react";
import { FaHome, FaMap } from "react-icons/fa";
import { MdImportContacts } from "react-icons/md";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { FiMenu, FiX } from "react-icons/fi"; // Menu icons for mobile

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="bg-gradient-to-b from-slate-800 to-gray-800 text-white p-5 sticky top-4 m-4 z-10 rounded-xl shadow-lg">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-semibold text-center noto-serif-jp-400 lg:invisible sm:visible">
          嵐
        </div>

        {/* Desktop Navigation Links */}

        <Link
          href="/"
          className="flex items-center space-x-2 hover:bg-slate-600 p-2 rounded-md transition-colors duration-300"
        >
          <FaHome />
        </Link>
        <Link
          href="/weather"
          className="flex items-center space-x-2 hover:bg-slate-600 p-2 rounded-md transition-colors duration-300"
        >
          <TiWeatherPartlySunny />
        </Link>
        <Link
          href="#"
          className="flex items-center space-x-2 hover:bg-slate-600 p-2 rounded-md transition-colors duration-300"
        >
          <FaMap />
        </Link>
        <Link
          href="/about"
          className="flex items-center space-x-2 hover:bg-slate-600 p-2 rounded-md transition-colors duration-300"
        >
          <MdImportContacts />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
