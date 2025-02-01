"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaCode,
  FaRobot,
  FaLightbulb,
  FaTools,
} from "react-icons/fa";
import Link from "next/link";

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="mb-16 p-8 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-lg"
  >
    <h2 className="text-3xl font-bold mb-6 flex items-center text-blue-600 dark:text-blue-400">
      {icon}
      <span className="ml-4">{title}</span>
    </h2>
    {children}
  </motion.section>
);

const Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
            Tempest (嵐)
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            The Coding Journey: From Bugs to Glory
          </p>
        </motion.header>

        <Section title="The Struggle" icon={<FaCode className="text-3xl" />}>
          <p className="text-lg mb-4">
            Errors were my daily companions.{" "}
            <span className="text-blue-500">Syntax errors</span>,{" "}
            <span className="text-blue-500">null pointer exceptions</span>, and{" "}
            <span className="text-blue-500">"undefined is not a function"</span>{" "}
            warnings became my second language.
          </p>
          <p className="text-lg">
            Every solved problem felt like conquering a{" "}
            <span className="text-blue-500">mountain</span>, only to find
            another peak looming behind it.
          </p>
        </Section>

        <Section
          title="AI: The Unpredictable Ally"
          icon={<FaRobot className="text-3xl" />}
        >
          <ul className="space-y-4">
            {[
              '"AI, can you please solve this bug for me?" - Spoiler: It can\'t.',
              'AI suggested a solution… turns out, it was just a "return null" response.',
              "Sometimes AI helps faster than Google. Other times, it's just... there.",
              "AI: like an overenthusiastic intern with unpredictable results.",
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center"
              >
                <FaArrowRight className="text-blue-500 mr-4" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </Section>

        <Section title="Fun Fact" icon={<FaLightbulb className="text-3xl" />}>
          <p className="text-lg mb-4">
            Despite the chaos, I kept pushing forward. Why? Because coding is
            always this chaotic! It's the chaos that makes the journey exciting.
          </p>
          <p className="text-lg">
            My productivity hacks? Pizza, caffeine, and a little bit of
            "motivational" yelling at my screen. I swear the code will work if I
            yell loud enough.
          </p>
        </Section>

        <Section title="Tech Arsenal" icon={<FaTools className="text-3xl" />}>
          <ul className="space-y-4">
            {[
              {
                name: "VS Code",
                desc: "My loyal code editor that knows me better than my own reflection.",
              },
              {
                name: "GitHub",
                desc: "Where all my attempts at version control go to die.",
              },
              {
                name: "Docker",
                desc: "Because setting up an environment by hand is so 2000s.",
              },
            ].map((tool, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center"
              >
                <FaArrowRight className="text-blue-500 mr-4" />
                <span>
                  <span className="font-semibold">{tool.name}</span>:{" "}
                  {tool.desc}
                </span>
              </motion.li>
            ))}
          </ul>
        </Section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Join the Chaos?</h3>
          <Link
            href="/contact"
            className="inline-block bg-blue-600 text-white py-3 px-8 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl"
          >
            Let's Talk <FaArrowRight className="inline ml-2" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
