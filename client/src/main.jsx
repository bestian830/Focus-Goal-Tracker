import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

// Set up Axios to send cookies with every request
axios.defaults.withCredentials = true;

// This is the main entry point for the client application. (main page)
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
