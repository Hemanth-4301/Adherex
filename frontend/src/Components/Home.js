import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import homeBg from "../Assets/home123.jpg";
import ThemeToggle from "./ThemeToggle";
import ParticlesBackground from "./ParticlesBackground";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const Home = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const authDataStr = localStorage.getItem("adherex_auth");
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        // Check if auth is still valid (not expired)
        if (Date.now() < authData.expiresAt) {
          navigate("/userDashboard");
          return;
        } else {
          // Auth expired, clear it
          localStorage.clear();
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        localStorage.clear();
      }
    }

    const timer = setTimeout(() => setLoaded(true), 200); // fade-in delay
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleStart = () => {
    navigate("/login");
  };

  const { theme } = useTheme();

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Background image - always visible */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${homeBg})` }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-[1]"></div>

      {/* Particles Background */}
      <div className="absolute inset-0 z-[2]">
        <ParticlesBackground isDark={theme === "dark"} />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Main content card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-[20] text-center p-8 sm:p-12 md:p-16 rounded-2xl 
                   bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 
                   shadow-2xl max-w-2xl mx-4"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-4 font-bold text-6xl sm:text-7xl md:text-8xl text-white"
        >
          Adherex
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8 text-lg md:text-xl text-gray-100 max-w-lg mx-auto"
        >
          Your intelligent medication adherence companion
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 md:px-16 py-4 font-semibold text-lg 
                     bg-white text-black rounded-lg 
                     transition-all duration-200 hover:bg-gray-100
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          onClick={handleStart}
        >
          Get Started
        </motion.button>
      </motion.div>

      {/* Optional subtle floating sparkles */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          animation: "moveBg 60s linear infinite",
        }}
      ></div>

      <style>
        {`
          @keyframes moveBg {
            0% { background-position: 0 0; }
            100% { background-position: 1000px 1000px; }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
