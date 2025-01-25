"use client";

import { useState, useEffect, useRef } from "react";
import { FiMoon, FiSun, FiMenu, FiX } from "react-icons/fi";
import gsap from "gsap";

type NavItem = {
  name: string;
  href: string;
};

const Navbar: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, scaleY: 0 },
        { opacity: 1, scaleY: 1, duration: 0.3, ease: "power2.out" }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        opacity: 0,
        scaleY: 0,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [isMobileMenuOpen]);

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Weather", href: "/weather" },
    { name: "Radar", href: "/weatherMap" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <a
              href="/"
              className="text-xl font-bold text-gray-800 dark:text-white"
            >
              Logo
            </a>
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                >
                  {name}
                </a>
              ))}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 mr-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white focus:outline-none"
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="pt-16">
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden px-2 pt-2 pb-3 space-y-2 origin-top transform scale-y-0"
          >
            {navItems.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                className="block px-3 py-2 rounded-md text-xl text-center font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {name}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
