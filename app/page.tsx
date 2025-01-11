"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaCloudSun,
  FaUmbrella,
  FaGlobe,
  FaBolt,
  FaWind,
} from "react-icons/fa";

const Modal = ({ isOpen, onClose, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        className="bg-nord-6 rounded-lg shadow-lg p-6 w-full max-w-md text-nord-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-nord-3 hover:text-nord-2"
        >
          &times;
        </button>
        {children}
      </motion.div>
    </div>
  );
};

const Page = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-nord-0 to-nord-1 text-nord-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8 sm:mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold mb-4 text-nord-7">嵐</h1>
        <h2 className="text-3xl font-extrabold mb-4 text-nord-8">Tempest</h2>
        <p className="text-lg text-nord-4">Weather at its Coolest</p>
      </motion.div>

      {/* Feature Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 w-full max-w-6xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {[
          { icon: FaCloudSun, text: "Real-time Updates" },
          { icon: FaUmbrella, text: "Rain Forecast" },
          { icon: FaGlobe, text: "Global Coverage" },
          { icon: FaBolt, text: "Severe Weather Alerts" },
          { icon: FaWind, text: "Wind Speed & Direction" },
          { icon: FaArrowRight, text: "Customizable Dashboard" },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-nord-2 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-md text-nord-6"
          >
            <feature.icon className="text-4xl mb-3 text-nord-9" />
            <p className="text-lg font-semibold">{feature.text}</p>
          </div>
        ))}
      </motion.div>

      {/* Call-to-Action */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-2xl font-bold mb-6">Experience the Storm</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-nord-7 hover:bg-nord-8 text-nord-6 font-bold py-3 px-6 rounded-full transition duration-300 transform hover:scale-105"
        >
          Launch Arashi <FaArrowRight className="inline-block ml-2" />
        </button>
      </motion.div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4 text-nord-10">
          Welcome to Arashi
        </h2>
        <p className="text-nord-3 mb-6">
          Explore the coolest weather updates and experience the storm at its
          best.
        </p>
        <button
          onClick={() => setModalOpen(false)}
          className="bg-nord-9 text-nord-6 py-2 px-4 rounded hover:bg-nord-10"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default Page;
