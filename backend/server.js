import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import patientRoutes from "./routes/patientRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";
import consumedRoutes from "./routes/consumedRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://adherex-sm.vercel.app"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Adherex Backend Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/", patientRoutes); // Patient routes (register, login, etc.)
app.use("/medications", medicationRoutes); // Medication routes
app.use("/consumed", consumedRoutes); // Consumed routes
app.use("/api/gemini/medication", geminiRoutes); // Gemini AI routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}`);
  console.log(`💊 Adherex Backend - MERN Stack\n`);
});

export default app;
