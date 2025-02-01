"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
  FaCloud,
  FaSun,
  FaBolt,
  FaWind,
  FaUser,
  FaIndustry,
  FaPlane,
  FaLeaf,
  FaMobileAlt,
  FaChartLine,
  FaShieldAlt,
  FaGlobe,
} from "react-icons/fa";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-16 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg"
  >
    <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
      {title}
    </h2>
    {children}
  </motion.section>
);

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-6 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-md transition-all duration-300"
  >
    <Icon className="text-4xl mb-4 text-blue-500" />
    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </motion.div>
);

const UseCaseItem: React.FC<{ icon: React.ElementType; text: string }> = ({
  icon: Icon,
  text,
}) => (
  <motion.li
    whileHover={{ x: 5 }}
    className="flex items-center space-x-3 text-gray-700 dark:text-gray-300"
  >
    <Icon className="text-blue-500" />
    <span>{text}</span>
  </motion.li>
);

const CommitmentItem: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <motion.div whileHover={{ y: -5 }} className="flex items-start space-x-4">
    <Icon className="text-3xl text-blue-500" />
    <div>
      <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </motion.div>
);

const Page: React.FC = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
            WeatherApp
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Precision forecasts meet elegant design.
          </p>
        </motion.header>

        <Section title="Our Mission">
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            At WeatherApp, we're dedicated to providing accurate, timely, and
            easy-to-understand weather information. Our goal is to help you make
            informed decisions, whether you're planning your day or preparing
            for a major event.
          </p>
        </Section>

        <Section title="Key Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              icon={FaCloud}
              title="Precise Forecasts"
              description="Advanced algorithms for accurate predictions"
            />
            <FeatureCard
              icon={FaSun}
              title="Visual Clarity"
              description="Intuitive, beautiful weather visualizations"
            />
            <FeatureCard
              icon={FaBolt}
              title="Real-time Updates"
              description="Instant alerts for changing conditions"
            />
            <FeatureCard
              icon={FaWind}
              title="Global Coverage"
              description="Worldwide weather data at your fingertips"
            />
          </div>
        </Section>

        <Section title="Use Cases">
          <ul className="space-y-4">
            <UseCaseItem
              icon={FaUser}
              text="Personal daily planning and event scheduling"
            />
            <UseCaseItem
              icon={FaIndustry}
              text="Business operations and logistics management"
            />
            <UseCaseItem
              icon={FaPlane}
              text="Travel planning and itinerary optimization"
            />
            <UseCaseItem
              icon={FaLeaf}
              text="Agricultural decision-making and crop management"
            />
          </ul>
        </Section>

        <Section title="Technology">
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• Machine learning models for improved forecast accuracy</li>
            <li>• Real-time data processing for up-to-the-minute updates</li>
            <li>
              • Advanced visualization techniques for intuitive data
              representation
            </li>
            <li>• Scalable cloud infrastructure ensuring reliable service</li>
          </ul>
        </Section>

        <Section title="Our Commitment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CommitmentItem
              icon={FaMobileAlt}
              title="User-Centric Design"
              description="Intuitive interface for all user levels"
            />
            <CommitmentItem
              icon={FaChartLine}
              title="Continuous Improvement"
              description="Regular updates based on user feedback"
            />
            <CommitmentItem
              icon={FaShieldAlt}
              title="Data Privacy"
              description="Your information is always protected"
            />
            <CommitmentItem
              icon={FaGlobe}
              title="Global Accessibility"
              description="Available worldwide, in multiple languages"
            />
          </div>
        </Section>

        <Section title="Join WeatherApp">
          <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
            Experience the future of weather forecasting. Join thousands of
            satisfied users who trust WeatherApp for their daily weather needs.
          </p>
          <div className="text-center">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300"
            >
              Get Started
            </motion.a>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Page;
