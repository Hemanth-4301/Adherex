import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import homeBg from "../Assets/home123.jpg";
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200); // fade-in delay
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    navigate("/login");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${homeBg})`,
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

      {/* Glass card with animation */}
      <div
        className={`text-center text-white p-5 rounded`}
        style={{
          backdropFilter: "blur(15px)",
          background: "rgba(255, 255, 255, 0.1)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          borderRadius: "20px",
          transform: loaded ? "translateY(0)" : "translateY(-50px)",
          opacity: loaded ? 1 : 0,
          transition: "all 1s ease",
        }}
      >
        <h1
          className="mb-4 fw-bold"
          style={{
            fontSize: "5rem",
            textShadow: "2px 2px 10px rgba(0,0,0,0.7)",
            animation: loaded ? "fadeIn 1.5s ease forwards" : "none",
          }}
        >
        Adherex
        </h1>
        <button
          className="btn btn-gradient btn-lg px-5 py-3 fw-bold"
          onClick={handleStart}
          style={{
            background: "linear-gradient(90deg, #6a11cb, #2575fc)",
            border: "none",
            color: "#fff",
            fontSize: "1.2rem",
            transition: "all 0.4s ease",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 6px 25px rgba(0,0,0,0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
          }}
        >
          Let Start
        </button>
      </div>

      {/* Optional subtle floating sparkles */}
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
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
};

export default Home;
