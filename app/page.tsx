"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa"; // React Icon for CTA button
import Link from "next/link";

const page = () => {
  return (
    <div className="homepage min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-12 xl:px-24">
      {/* Header Section with Framer Motion */}
      <motion.div
        className="header text-center text-white mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl text-slate-100 text-shadow noto-serif-jp-400">
          嵐
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold lexend-500 mb-4 text-blue-500">
          Tempest
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl mb-6">
          Your Personal Weather Companion
        </p>
      </motion.div>

      {/* App Description Section with Framer Motion */}
      <motion.div
        className="description-section text-white text-center px-6 sm:px-12 lg:px-24 mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4 lexend-400">
          What is Arashi?
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-6 lexend-300">
          Arashi (嵐) is a cutting-edge weather application designed to provide
          users with accurate and real-time weather updates. Whether you're
          planning your day, heading out for a trip, or just curious about the
          weather, Arashi gives you all the information you need at a glance.
          From current temperatures to rain chances and weather conditions,
          Arashi makes it easy to stay informed.
        </p>
        <p className="text-sm sm:text-base mb-6">
          With its clean, user-friendly interface, Arashi is designed to be your
          go-to weather app, providing fast and reliable weather updates for
          cities all around the globe.
        </p>
      </motion.div>

      {/* Key Features Section with Framer Motion */}
      <motion.div
        className="features-section text-white text-center mb-12 px-6 sm:px-12 lg:px-24"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4">
          Key Features:
        </h3>
        <ul className="list-disc pl-6 text-base sm:text-lg max-w-xl  flex justify-center items-center flex-col">
          <motion.li
            className="flex items-center mb-4 hover:text-blue-400 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            Current temperature in Celsius for any city
          </motion.li>
          <motion.li
            className="flex items-center mb-4 hover:text-blue-400 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            Chance of rain for the next hour
          </motion.li>
          <motion.li
            className="flex items-center mb-4 hover:text-blue-400 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            Weather icons to visually represent conditions
          </motion.li>
          <motion.li
            className="flex items-center mb-4 hover:text-blue-400 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            Simple, clean, and intuitive interface
          </motion.li>
          <motion.li
            className="flex items-center mb-4 hover:text-blue-400 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            Fast, real-time weather updates
          </motion.li>
          <motion.li
            className="flex items-center mb-4 hover:text-blue-400 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            Global city and country search support
          </motion.li>
        </ul>
      </motion.div>

      {/* Testimonials Section with Framer Motion */}
      <motion.div
        className="testimonials-section text-white text-center mb-12 px-6 sm:px-12 lg:px-24"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4">
          What Our Users Say:
        </h3>
        <div className="testimonials grid grid-cols-1 sm:grid-cols-2 gap-8">
          <motion.div
            className="testimonial bg-slate-800 p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg mb-4">
              "Arashi is my go-to weather app! It's accurate, easy to use, and
              visually appealing. I love how quickly I can check the weather!"
            </p>
            <p className="font-semibold">Anika Sharma</p>
            <p className="text-sm text-gray-300">Frequent Traveler</p>
          </motion.div>
          <motion.div
            className="testimonial bg-slate-800 p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-lg mb-4">
              "I can easily see the temperature and rain chances. The icons make
              it fun, and I never have to guess the weather anymore!"
            </p>
            <p className="font-semibold">Ravi Kumar</p>
            <p className="text-sm text-gray-300">Outdoor Enthusiast</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Call to Action Section with Framer Motion */}
      <motion.div
        className="cta-section text-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4">
          Start Using Arashi Today
        </h3>
        <p className="text-lg sm:text-xl mb-6">
          Download Arashi and get accurate, real-time weather updates anytime,
          anywhere. Whether you're at home or traveling, Arashi is here to keep
          you informed.
        </p>
        <Link
          href="/weather"
          className="bg-blue-600 text-white p-4 rounded-md text-lg font-semibold hover:bg-blue-500 hover:text-blue-400 transition duration-300"
        >
          Get Started <FaArrowRight className="inline-block ml-2" />
        </Link>
      </motion.div>
    </div>
  );
};

export default page;
