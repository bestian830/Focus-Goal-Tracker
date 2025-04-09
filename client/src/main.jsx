import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import App from "./App.jsx";

// 檢查環境變量
console.log("=== 主入口環境檢查 ===");
console.log("MODE:", import.meta.env.MODE);
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("======================");

// Set up Axios to send cookies with every request
axios.defaults.withCredentials = true;

// This is the main entry point for the client application. (main page)
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
