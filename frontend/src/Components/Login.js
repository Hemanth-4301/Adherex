import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config";
import loginBg from "../Assets/home123.jpg";
import { toast } from "react-toastify";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import Loader from "./Loader";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const authDataStr = localStorage.getItem("adherex_auth");
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        if (Date.now() < authData.expiresAt) {
          navigate("/userDashboard");
          return;
        } else {
          localStorage.clear();
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        localStorage.clear();
      }
    }

    const timer = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/login`, {
        email,
        password,
      });
      const patient = response.data.patient;
      const authData = {
        role: response.data.role,
        pid: patient._id,
        name: patient.name,
        email: patient.email,
        careTakerEmail: patient.careTakerEmail,
        expiresAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
      };

      localStorage.setItem("adherex_auth", JSON.stringify(authData));
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("pid", patient._id);
      localStorage.setItem("name", patient.name);
      localStorage.setItem("email", patient.email);
      localStorage.setItem("careTakerEmail", patient.careTakerEmail);

      toast.success("Login successful!", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/userDashboard"), 2200);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      toast.error("Login failed. Check your credentials.", {
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
        style={{ backgroundImage: `url(${loginBg})` }}
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
          Login
        </motion.h3>
        <form onSubmit={handleLogin} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-100"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
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
            transition={{ delay: 0.4 }}
          >
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-100"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm text-white 
                                            border border-white/30 rounded-lg focus:outline-none 
                                            focus:ring-2 focus:ring-white/50 placeholder:text-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </motion.div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex items-center justify-center h-12 mt-6 bg-white hover:bg-gray-100
                     text-black font-semibold rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? <Loader size="sm" text="" /> : "Login"}
          </motion.button>
        </form>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-sm text-gray-200"
        >
          Don't have an account?{" "}
          <span
            className="text-white font-semibold cursor-pointer hover:underline transition-all"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
