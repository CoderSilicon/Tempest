"use client";

import Link from "next/link";
import React from "react";
import { FaHome, FaMap } from "react-icons/fa";
import { MdImportContacts } from "react-icons/md";
import { TiWeatherPartlySunny } from "react-icons/ti";

const Navbar = () => {
  const navItems = [
    { href: "/", icon: FaHome },
    { href: "/weather", icon: TiWeatherPartlySunny },
    { href: "/weatherMap", icon: FaMap },
    { href: "/about", icon: MdImportContacts },
  ];

  return (
    <>
      {/* Top navbar for larger screens */}
      <nav className="hidden lg:flex justify-between items-center bg-gradient-to-b from-slate-800 to-gray-800 text-white px-4 py-4 shadow-lg m-4 rounded-3xl sticky top-4 z-50">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-semibold noto-serif-jp-400 text-center px-6"
        >
          嵐
        </Link>

        {/* Navigation Links */}
        <div className="flex justify-center items-center gap-4">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center justify-center text-xl p-4 hover:bg-slate-700 rounded-2xl transition-colors duration-300"
            >
              <item.icon />
            </Link>
          ))}
        </div>
      </nav>

      {/* Fixed Bottom Bar for smaller screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-b from-slate-800 to-gray-800 text-white px-4 py-2 shadow-lg">
        <div className="flex justify-around items-center">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex flex-col items-center text-xl p-2 hover:bg-slate-700 rounded-xl transition-colors duration-300"
            >
              <item.icon />
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
