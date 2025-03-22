// Description: Main server file for the Express.js backend. first part: as the door to the restaurant

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// import routes
const authRoutes = require("./routes/auth");
const tempUserRoutes = require("./routes/tempUserRoutes");
const userRoutes = require("./routes/userRoutes");
// add other routes import as needed

// load env variables
dotenv.config();

// connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Enable cookies with CORS
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow only specified methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow only specified headers
  })
);
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies

// Set port from environment variables or use default
const PORT = process.env.PORT || 5050;

// Routes
// Auth routes - handles user authentication (including guest login)
app.use("/api/auth", authRoutes);

// Goals routes - handles goal management
app.use("/api/goals", require("./routes/goals"));

// Progress routes - handles progress tracking
app.use("/api/progress", require("./routes/progress"));

// Temp User routes - handles temporary user management
app.use("/api/temp-users", tempUserRoutes);

// User routes - handles user profile management
app.use("/api/users", userRoutes);

// Test API - simple endpoint to verify server is running
app.get("/", (req, res) => {
  res.send("Hello from Express Server!");
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
});

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "resource not found"
    }
  });
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
