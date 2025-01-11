"use client";

import Link from "next/link";
import React from "react";
import { FaHome, FaMap } from "react-icons/fa";
import { MdImportContacts } from "react-icons/md";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const navItems = [
  { href: "/", icon: FaHome, label: "Home" },
  { href: "/weather", icon: TiWeatherPartlySunny, label: "Weather" },
  { href: "/weatherMap", icon: FaMap, label: "Map" },
  { href: "/about", icon: MdImportContacts, label: "About" },
];

const Navbar = () => {
  const [isSheetOpen, setSheetOpen] = React.useState(false);

  return (
    <nav className="bg-polar-night-light p-4 sticky top-0 z-50 ">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-3xl font-semibold text-frost">
          嵐
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="text-snow-storm hover:text-frost hover:bg-polar-night"
            >
              <Link href={item.href} className="flex items-center">
                <item.icon className="mr-2" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            className="text-snow-storm hover:text-frost hover:bg-polar-night"
            onClick={() => setSheetOpen(true)}
          >
            <Menu />
          </Button>

          {/* Mobile Sheet */}
          {isSheetOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 transition-all">
              <div className="bg-polar-night-light w-[300px] sm:w-[400px] h-full p-6">
                <button
                  onClick={() => setSheetOpen(false)}
                  className="absolute top-4 right-4 text-snow-storm hover:text-frost"
                >
                  &times;
                </button>
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="text-snow-storm hover:text-frost hover:bg-polar-night justify-start"
                    >
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2" />
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
