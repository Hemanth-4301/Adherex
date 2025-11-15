import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../App";
import bgImage from "../Assets/home123.jpg";
import 'bootstrap/dist/css/bootstrap.min.css';

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
      alert("Registration successful!");
      navigate("/login"); // Redirect to login after registration
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(5%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dark overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      ></div>

      {/* Glass card */}
      <div
        className="p-4 text-white"
        style={{
          backdropFilter: "blur(15px)",
          background: "rgba(255,255,255,0.1)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          borderRadius: "20px",
          width: "400px",
          transform: loaded ? "translateY(0)" : "translateY(-50px)",
          opacity: loaded ? 1 : 0,
          transition: "all 1s ease",
        }}
      >
        <h3 className="text-center mb-4 fw-bold" style={{ textShadow: "2px 2px 10px rgba(0,0,0,0.7)" }}>
          Register
        </h3>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Care Taker Email</label>
            <input
              type="email"
              className="form-control"
              value={careTakerEmail}
              onChange={(e) => setCareTakerEmail(e.target.value)}
              required
              placeholder="Enter care taker email"
            />
          </div>

          <button
  type="submit"
  className="btn w-100 fw-bold d-flex justify-content-center align-items-center"
  style={{
    background: "linear-gradient(90deg, #6a11cb, #2575fc)",
    border: "none",
    color: "#fff",
    fontSize: "1.1rem",
    transition: "all 0.4s ease",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    height: "45px"
  }}
  disabled={loading}
  onMouseEnter={(e) => {
    if (!loading) {
      e.target.style.transform = "scale(1.05)";
      e.target.style.boxShadow = "0 6px 25px rgba(0,0,0,0.5)";
    }
  }}
  onMouseLeave={(e) => {
    if (!loading) {
      e.target.style.transform = "scale(1)";
      e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
    }
  }}
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
    "Register"
  )}
</button>

        </form>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <span
            className="text-primary"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/login")}
          >
            Login
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
