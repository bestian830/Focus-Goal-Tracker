const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// load env variables
dotenv.config();

// connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;



// test API
app.get("/", (req, res) => {
  res.send("Hello from Express Server!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
