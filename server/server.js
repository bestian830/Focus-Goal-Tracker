// Description: Main server file for the Express.js backend. first part: as the door to the restaurant

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

// import routes
import authRoutes from "./routes/auth.js";
import tempUserRoutes from "./routes/tempUserRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadsRoutes from "./routes/uploads.js"; // 添加上傳路由
// add other routes import as needed

// import directly for routes that are immediately used
import goalsRoutes from "./routes/goals.js";
import progressRoutes from "./routes/progress.js";
import reportsRoutes from './routes/reports.js'; // <--- 添加导入

// load env variables
dotenv.config();

// connect to MongoDB
connectDB();

const app = express();

// CORS Configuration - Using function version for more flexibility
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173", 
      "https://focusappdeploy-frontend.onrender.com", 
      "https://focusfinalproject-frontend-original.onrender.com", 
      "https://focusfinalproject-frontend-original-repo.onrender.com"
    ];
    
    // Add CLIENT_URL from environment variable if available
    if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
      allowedOrigins.push(process.env.CLIENT_URL);
    }
    
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"]
}));

// Add a middleware to log every request for debugging CORS issues
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request received:`, {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    host: req.headers.host
  });
  
  // Add CORS headers directly as a backup
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// Log CORS configuration (for debugging)
console.log("=== CORS Configuration ===");
console.log("Using simplified CORS with direct origins");
console.log("=======================");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Reports routes - handles AI report generation
app.use("/api/reports", reportsRoutes);

// Health check endpoint - for client to verify API availability
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Test API - simple endpoint to verify server is running
app.get("/", (req, res) => {
  res.send("Hello from Express Server!");
});

// CORS test endpoint - to verify CORS is working
app.get("/api/test-cors", (req, res) => {
  res.json({
    success: true, 
    message: "CORS is working correctly",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
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

// Connect to MongoDB & start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully!");
    
    // 手动清理所有可能存在的唯一索引
    try {
      const db = mongoose.connection.db;
      console.log("开始检查并移除所有可能的唯一索引...");
      
      // 获取当前集合上的所有索引
      const indexes = await db.collection('goals').indexes();
      console.log("现有索引:", JSON.stringify(indexes));
      
      // 尝试删除所有可能与userId和title相关的唯一索引
      const indexesToDrop = [
        'userId_1_title_1', 
        'title_1_userId_1',
        'title_1',
        'userId_1_title_1_unique'
      ];
      
      for (const indexName of indexesToDrop) {
        try {
          await db.collection('goals').dropIndex(indexName);
          console.log(`成功删除索引: ${indexName}`);
        } catch (err) {
          console.log(`尝试删除索引 ${indexName}: ${err.message}`);
        }
      }
      
      // 重建非唯一索引
      await db.collection('goals').createIndex({ userId: 1, title: 1 }, { unique: false, background: true });
      console.log("成功重建非唯一索引");
      
    } catch (indexError) {
      console.log("索引处理过程中出错:", indexError.message);
      // 继续执行，不要因为索引问题而阻止服务器启动
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}!`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
