import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [careTakerEmail, setCareTakerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200); // fade-in delay
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/register`, {
        name,
        email,
        password,
        careTakerEmail,
      });
      console.log("Registration success:", response.data);
      toast.success("Registration successful! Please login.", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/login"), 2200);
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      toast.error("Registration failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 gradient-bg fade-in"
      style={{
        background: colors.gradient,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: isDarkMode ? "rgba(15,23,42,0.3)" : "rgba(0,0,0,0.2)" }}
      ></div>

      {/* Glass card */}
      <div
        className="p-4 p-sm-5 glass-effect"
        style={{
          backdropFilter: "blur(20px)",
          background: isDarkMode 
            ? "rgba(30, 41, 59, 0.8)" 
            : "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          borderRadius: "24px",
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
          width: "90%",
          maxWidth: "500px",
          transform: loaded ? "translateY(0)" : "translateY(-50px)",
          opacity: loaded ? 1 : 0,
          transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <h2 className="text-center mb-4 fw-bold" 
          style={{ 
            color: colors.text,
            background: colors.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)"
          }}
        >
          Create Account
        </h2>
        <p className="text-center mb-4" style={{ color: colors.textSecondary }}>
          Join us to manage your medications effectively
        </p>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: colors.text }}>Full Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              style={{
                backgroundColor: isDarkMode ? colors.surface : colors.card,
                color: colors.text,
                border: `2px solid ${isDarkMode ? colors.border : '#e2e8f0'}`,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: colors.text }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                backgroundColor: isDarkMode ? colors.surface : colors.card,
                color: colors.text,
                border: `2px solid ${isDarkMode ? colors.border : '#e2e8f0'}`,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: colors.text }}>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                backgroundColor: isDarkMode ? colors.surface : colors.card,
                color: colors.text,
                border: `2px solid ${isDarkMode ? colors.border : '#e2e8f0'}`,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ color: colors.text }}>Care Taker Email</label>
            <input
              type="email"
              className="form-control"
              value={careTakerEmail}
              onChange={(e) => setCareTakerEmail(e.target.value)}
              required
              placeholder="Enter care taker email"
              style={{
                backgroundColor: isDarkMode ? colors.surface : colors.card,
                color: colors.text,
                border: `2px solid ${isDarkMode ? colors.border : '#e2e8f0'}`,
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold btn-gradient"
            style={{
              background: colors.primaryGradient,
              border: "none",
              color: "#fff",
              fontSize: "1.125rem",
              padding: "14px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div
                  className="spinner-border spinner-border-sm text-light me-2"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                Registering...
              </>
            ) : (
              "Create Account"
            )}
          </button>

        </form>

        <p className="mt-4 text-center" style={{ color: colors.textSecondary }}>
          Already have an account?{" "}
          <span
            style={{ 
              cursor: "pointer", 
              fontWeight: "600",
              background: colors.primaryGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
            onClick={() => navigate("/login")}
          >
            Login Here
          </span>
        </p>
      </div>

      {/* Optional sparkles */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
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

export default Register;
