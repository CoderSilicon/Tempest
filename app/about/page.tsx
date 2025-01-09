"use client";
import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa"; // React Icon for CTA button
import Link from "next/link";

const page = () => {
  return (
    <div className="aboutpage min-h-screen flex flex-col items-center justify-center py-12">
      {/* Header Section with Framer Motion */}
      <motion.div
        className="header text-center text-white mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl text-blue-500 lexend-500">
          About Tempest (嵐)
        </h1>
        <h2 className="text-4xl font-semibold lexend-500 mb-4 text-blue-500">
          The Coding Journey of Building This Masterpiece (or Disasterpiece?)
        </h2>
        <p className="text-2xl mb-6">From Bugs to Glory (Mostly Bugs)</p>
      </motion.div>

      {/* Struggle Section with Framer Motion */}
      <motion.div
        className="struggle-section text-white text-center px-6 sm:px-12 lg:px-24 mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-semibold mb-4 lexend-400">
          How I Struggled Day and Night:
        </h2>
        <p className="text-xl mb-6 lexend-300">
          Let me tell you... I didn’t just code, I *struggled*. Errors? Oh, I
          had them like I had too many cups of coffee.{" "}
          <span className="text-blue-500">Syntax errors</span>,{" "}
          <span className="text-blue-500">null pointer exceptions</span>, and "
          <span className="text-blue-500">undefined is not a function</span>"
          warnings were my daily companions. My screen looked like a
          battlefield, with a pop-up warzone of red error messages. I fought my
          way through lines of code, only to be met with more bugs! But hey, who
          said the life of a programmer was easy?
        </p>
        <p className="text-lg mb-6 lexend-400">
          It took me countless sleepless nights, stacks of pizza boxes, and a
          lot of “Googling” (and a bit of praying) to finally make things
          actually work. Every time I solved a problem, I felt like I had
          conquered a <span className="text-blue-500">mountain</span>. Only to
          find... there was another mountain behind it. Maybe next time, I'll
          try summiting the mountain of productivity... or at least grab another
          coffee to keep the cycle going!
        </p>
        <p className="text-lg mb-6 lexend-400">
          And let’s not forget that feeling when you think you’ve finally fixed
          that bug, only for a new, even more cryptic one to pop up. It’s like
          playing Whack-a-Mole, but instead of moles, you’re hitting infinite
          bugs.{" "}
          <span className="text-blue-500">
            Code logic is a battlefield, and I’m its clumsy general.
          </span>
        </p>
      </motion.div>

      {/* AI Section with Framer Motion */}
      <motion.div
        className="ai-section text-white text-center mb-12 px-6 sm:px-12 lg:px-24"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-semibold mb-4">Enter AI... My Hero?</h3>
        <ul className="list-disc pl-6 text-lg max-w-xl mx-auto">
          <motion.li
            className="flex items-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            "AI, can you please solve this bug for me?" - Spoiler: It can't.
          </motion.li>
          <motion.li
            className="flex items-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            AI suggested a solution… turns out, it was just a "return null"
            response. Thanks, AI! Oh wait, it also asked me to "Check my
            internet connection." Seriously? 🤦‍♂️
          </motion.li>
          <motion.li
            className="flex items-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            Despite all the jokes, AI sometimes helps me fix my code faster than
            I can Google it. But only sometimes. Other times it’s just like that
            one friend who shows up, says “What’s up?” and then leaves without
            doing anything.
          </motion.li>
          <motion.li
            className="flex items-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            But, hey, AI is like that overenthusiastic intern: sometimes you get
            decent results, and other times you’re left wondering, "Why did I
            even ask?"
          </motion.li>
        </ul>
      </motion.div>

      {/* Fun Fact Section with Framer Motion */}
      <motion.div
        className="funfact-section text-white text-center mb-12 px-6 sm:px-12 lg:px-24"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-semibold mb-4">Fun Fact:</h3>
        <p className="text-xl mb-6 lexend-300">
          Despite all the errors and bugs I faced, I kept pushing forward
          because there's one thing I knew for sure: the path of coding was
          always going to be this chaotic! But it’s this very chaos that makes
          the journey exciting. Also, I couldn't stop because I have no idea how
          to fix a printer... so this is all I got.{" "}
          <span className="text-blue-500">You know what they say:</span> “If you
          can’t fix the printer, might as well code something!”
        </p>
        <p className="text-xl mb-6 lexend-300">
          And let's be honest, we all know the struggle of managing a dozen tabs
          open, from Stack Overflow to GitHub, while battling the urge to watch
          yet another cat video. But hey, you can’t code on an empty stomach,
          right? My productivity hacks? Pizza, caffeine, and a little bit of
          "motivational" yelling at my screen. I swear the code will work if I
          yell loud enough.
        </p>
      </motion.div>

      {/* Tech Tools Section with Framer Motion */}
      <motion.div
        className="tech-tools-section text-white text-center mb-12 px-6 sm:px-12 lg:px-24"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-semibold mb-4">
          Tech Tools Used: The Magic Ingredients
        </h3>
        <ul className="list-disc pl-6 text-lg max-w-xl mx-auto">
          <motion.li
            className="flex items-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            <span className="text-blue-500 text-xl">VS Code</span>: My loyal
            code editor that knows me better than my own reflection. I spend
            more time with it than anyone else.
          </motion.li>
          <motion.li
            className="flex items-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            <span className="text-blue-500">GitHub</span>: Where all my attempts
            at version control go to die. But hey, at least I’ve got a lot of
            “committed” files.
          </motion.li>
          <motion.li
            className="flex items-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FaArrowRight className="text-yellow-400 mr-4" />
            <span className="text-blue-500">Docker</span>: Because setting up an
            environment by hand is so 2000s. Now I just tell Docker to deal with
            it. 🐳
          </motion.li>
        </ul>
      </motion.div>

      {/* Call to Action Section with Framer Motion */}
      <motion.div
        className="cta-section text-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-semibold mb-4">
          Want to join the struggle? Let's Build Together!
        </h3>
        <p className="text-lg mb-6">
          Whether you're ready to code or just need a good laugh at my
          misfortune, join me in the coding chaos! Seriously, if I can do it,
          you can definitely do it. Or we can just watch cat videos. Your
          choice. 😜
        </p>
        <div className="flex justify-center items-center">
          <Link
            href="/contact"
            className="bg-blue-500 text-white py-3 px-8 rounded-lg text-lg flex items-center justify-center w-60"
          >
            Let's Talk <FaArrowRight className="ml-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default page;
