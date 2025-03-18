const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

// 連接 MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    console.error("🔍 Connection string used:", MONGO_URI);
  });

// 測試 API
app.get("/", (req, res) => {
  res.send("Hello from Express Server!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
