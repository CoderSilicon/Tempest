import Link from "next/link";
import React from "react";
import { FaHome, FaMap } from "react-icons/fa";
import { MdImportContacts } from "react-icons/md";
import { TiWeatherPartlySunny } from "react-icons/ti";

const Navbar = () => {
  return (
    <div className=" bg-gradient-to-b from-slate-800 to-gray-800 text-white p-5 sticky top-4 m-4 z-10 rounded-xl">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-semibold text-center noto-serif-jp-400">
          風
        </div>

        {/* Navigation Links */}
        <nav className="flex space-x-6">
          <Link href="/" className="hover:bg-slate-600 p-2 rounded-md">
            <FaHome />
          </Link>
          <Link href="/weather" className="hover:bg-slate-600 p-2 rounded-md">
            <TiWeatherPartlySunny />
          </Link>
          <Link href="#" className="hover:bg-slate-600 p-2 rounded-md">
            <FaMap />
          </Link>
          <Link href="#" className="hover:bg-slate-600 p-2 rounded-md">
            <MdImportContacts />
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
