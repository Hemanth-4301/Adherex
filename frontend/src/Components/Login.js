import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../config";
import loginBg from "../Assets/home123.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const authDataStr = localStorage.getItem("adherex_auth");
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        // Check if auth is still valid
        if (Date.now() < authData.expiresAt) {
          navigate("/userDashboard");
          return;
        } else {
          // Auth expired, clear it
          localStorage.clear();
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        localStorage.clear();
      }
    }
    
    const timer = setTimeout(() => setLoaded(true), 200); // fade-in delay
    return () => clearTimeout(timer);
  }, [navigate]);

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await axios.post(`${baseUrl}/login`, { email, password });
    console.log("Login success:", response.data);

   // ✅ Store authentication data in localStorage with expiration (2 days)
const patient = response.data.patient;
const authData = {
  role: response.data.role,
  pid: patient._id,
  name: patient.name,
  email: patient.email,
  careTakerEmail: patient.careTakerEmail,
  expiresAt: Date.now() + (2 * 24 * 60 * 60 * 1000) // 2 days in milliseconds
};

// Store in localStorage for persistent login
localStorage.setItem("adherex_auth", JSON.stringify(authData));

// Also set individual items for backward compatibility
localStorage.setItem("role", response.data.role);
localStorage.setItem("pid", patient._id);
localStorage.setItem("name", patient.name);
localStorage.setItem("email", patient.email);
localStorage.setItem("careTakerEmail", patient.careTakerEmail);



    toast.success("Login successful!", {
      position: "top-center",
      autoClose: 2000,
    });

    setTimeout(() => {
      navigate("/userDashboard");
    }, 2200);
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
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${loginBg})`,
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
        className="p-3 p-sm-4 text-white"
        style={{
          backdropFilter: "blur(15px)",
          background: "rgba(255,255,255,0.1)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "400px",
          transform: loaded ? "translateY(0)" : "translateY(-50px)",
          opacity: loaded ? 1 : 0,
          transition: "all 1s ease",
        }}
      >
        <h3
          className="text-center mb-4 fw-bold"
          style={{ textShadow: "2px 2px 10px rgba(0,0,0,0.7)" }}
        >
          Login
        </h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
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
              height: "45px",
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
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <span
            className="text-primary"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/register")}
          >
            Register
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

export default Login;
