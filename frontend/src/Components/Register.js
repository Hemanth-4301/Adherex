import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config";
import bgImage from "../Assets/home123.jpg";
import ThemeToggle from "./ThemeToggle";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Loader from "./Loader";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [careTakerEmail, setCareTakerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${baseUrl}/register`, {
        name,
        email,
        password,
        careTakerEmail,
      });
      toast.success("Registration successful! Please login.", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/login"), 2200);
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      toast.error("Registration failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden py-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75"></div>
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 p-8 bg-white/10 dark:bg-black/30 backdrop-blur-xl
                   border border-white/20 shadow-2xl rounded-2xl w-[90%] max-w-md"
      >
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6 font-bold text-3xl sm:text-4xl text-white"
        >
          Register
        </motion.h3>
        <form onSubmit={handleRegister} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block mb-2 text-sm font-medium text-gray-100">
              Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm text-white 
                                         border border-white/30 rounded-lg focus:outline-none 
                                         focus:ring-2 focus:ring-white/50 placeholder:text-gray-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block mb-2 text-sm font-medium text-gray-100">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm text-white 
                                         border border-white/30 rounded-lg focus:outline-none 
                                         focus:ring-2 focus:ring-white/50 placeholder:text-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block mb-2 text-sm font-medium text-gray-100">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm text-white 
                                         border border-white/30 rounded-lg focus:outline-none 
                                         focus:ring-2 focus:ring-white/50 placeholder:text-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block mb-2 text-sm font-medium text-gray-100">
              Care Taker Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm text-white 
                                         border border-white/30 rounded-lg focus:outline-none 
                                         focus:ring-2 focus:ring-white/50 placeholder:text-gray-300"
              value={careTakerEmail}
              onChange={(e) => setCareTakerEmail(e.target.value)}
              required
              placeholder="Enter care taker email"
            />
          </motion.div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex items-center justify-center h-12 mt-6 bg-white hover:bg-gray-100
                     text-black font-semibold rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? <Loader size="sm" text="" /> : "Register"}
          </motion.button>
        </form>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-sm text-gray-200"
        >
          Already have an account?{" "}
          <span
            className="text-white font-semibold cursor-pointer hover:underline transition-all"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
