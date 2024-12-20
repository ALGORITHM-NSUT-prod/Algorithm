import React, {useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import LighthouseScene from "./LightHouseScene";

const HeroSection = ({user, isLoading}) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      y: [50, 0],
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [controls]);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen text-white w-full overflow-hidden ">
      
        <LighthouseScene />


      <div className="relative z-10 flex flex-col items-center mt-10 p-4">
        <div className="flex items-center justify-center mb-4 flex-wrap">
          <img
            src="/static/algo.png"
            alt="Logo"
            className="w-24 h-18 md:w-32 md:h-24 lg:w-40 lg:h-30 mr-4"
          />
          <h1 className="text-[4rem] sm:text-[5rem] md:text-[6rem] lg:text-[180px] text-gray-200 font-bold mt-2 font-mono">
            ALGORITHM
          </h1>
        </div>

        <div className="text-gray-300 font-bold text-center mb-4 font-mono">
          <p className="text-xl lg:text-5xl">Code . Set . Go</p>
        </div>

        <p className="text-lg sm:text-xl max-w-3xl text-gray-400 text-center mb-8 px-4 font-sans">
          Join us to explore, learn, and innovate together!
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        className="relative z-10 mb-40"
      >
        <Link
          to={user ? '/login' : '/join-us'}
          className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 ease-in-out 
            ${isLoading ? 'bg-gray-500 cursor-wait rounded-full overflow-hidden hover:bg-gray-500' : 'rounded-full text-white bg-[#4c56d7] overflow-hidden hover:bg-[#3a42a5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4c56d7]'}`}
          disabled={isLoading}
          onClick={(e) => isLoading && e.preventDefault()} // Prevent navigation if loading
        >
          <span
            className={
              !isLoading ?
              `absolute inset-0 w-full h-full bg-gradient-to-br from-[#6a11cb] to-[#2575fc] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100`
              :''
            }
          ></span>
          <span className="relative z-10 flex items-center">
            <span className="mr-2">Join Now</span>
            {isLoading ? (
              <motion.div
                className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </motion.svg>
            )}
          </span>
        </Link>
      </motion.div>

    </div>
  );
}

export default HeroSection;