// Description: Main server file for the Express.js backend. first part: as the door to the restaurant

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// load env variables
dotenv.config();

// connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes (allows frontend to communicate with backend)
app.use(express.json()); // Parse JSON request bodies

// Set port from environment variables or use default
const PORT = process.env.PORT || 5050;

// Routes
// Auth routes - handles user authentication (including guest login)
app.use("/api/auth", require("./routes/auth"));

// Goals routes - handles goal management
app.use("/api/goals", require("./routes/goals"));

// Progress routes - handles progress tracking
app.use("/api/progress", require("./routes/progress"));

// Test API - simple endpoint to verify server is running
app.get("/", (req, res) => {
  res.send("Hello from Express Server!");
});

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
