// Description: Main server file for the Express.js backend. first part: as the door to the restaurant

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

// import routes
import authRoutes from "./routes/auth.js";
import tempUserRoutes from "./routes/tempUserRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadsRoutes from "./routes/uploads.js"; // 添加上傳路由
// add other routes import as needed

// import directly for routes that are immediately used
import goalsRoutes from "./routes/goals.js";
import progressRoutes from "./routes/progress.js";

// load env variables
dotenv.config();

// connect to MongoDB
connectDB();

const app = express();

// 配置允許的來源
const allowedOrigins = [
  "http://localhost:5173",  // 本地開發環境
  "https://focusappdeploy-frontend.onrender.com",  // Render部署的前端
  process.env.CLIENT_URL,  // 環境變量中配置的客戶端URL
].filter(Boolean); // 過濾掉 undefined 或 null

// Middleware
app.use(
  cors({
    origin: function(origin, callback) {
      // 允許沒有來源的請求（比如同源請求）
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // 允許跨域請求攜帶 cookie
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// 輸出CORS配置信息
console.log("=== CORS Configuration ===");
console.log("Allowed Origins:", allowedOrigins);
console.log("=======================");

app.use(express.json());
app.use(cookieParser());

// Set port from environment variables or use default
const PORT = process.env.PORT || 5050;

// Routes
// Auth routes - handles user authentication (including guest login)
app.use("/api/auth", authRoutes);

// Goals routes - handles goal management
app.use("/api/goals", goalsRoutes);

// Progress routes - handles progress tracking
app.use("/api/progress", progressRoutes);

// Temp User routes - handles temporary user management
app.use("/api/temp-users", tempUserRoutes);

// User routes - handles user profile management
app.use("/api/users", userRoutes);

// Uploads routes - handles file uploads to Cloudinary
app.use("/api/uploads", uploadsRoutes);

// Health check endpoint - for client to verify API availability
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString()
  });
});

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
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
});

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "resource not found",
    },
  });
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
