import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";
import "../styles/Login.css"; // We'll create this CSS file later

/**
 * Login Component
 *
 * This component:
 * 1. Displays a login form with email and password fields
 * 2. Handles form submission and authentication
 * 3. Stores user data and token in localStorage on successful login
 * 4. Provides links to Register and Guest Login pages
 *
 * Route: /login
 * Next route: / (after successful login)
 */
function Login() {
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Loading state for form submission
  const [loading, setLoading] = useState(false);

  // Error message state
  const [error, setError] = useState("");

  // Navigation hook for redirect after login
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const tempId = localStorage.getItem("tempId");
    
    // If userId or tempId exists, redirect to home page
    if (userId || tempId) {
      console.log("User already logged in, redirecting to home page");
      navigate("/");
    }
  }, [navigate]);

  /**
   * Update form data when inputs change
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error when user types
    if (error) setError("");
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    console.log("Starting login process...");

    try {
      // use wrapped API service for login
      console.log("Sending login request...");
      const response = await apiService.auth.login(formData);
      console.log("Login successful, response:", response.data);

      // check if cookie is set successfully
      const hasCookie = document.cookie.includes('token=');
      console.log("Cookie check:", {
        hasCookie: hasCookie,
        cookies: document.cookie
      });

      // Store user ID in localStorage
      localStorage.setItem("userId", response.data.data.id);
      console.log("User ID saved to localStorage:", response.data.data.id);

      // Redirect to home page
      console.log("Redirecting to home page...");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      // Display appropriate error message
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Focus</h1>
      <p className="subtitle">Log in to track your goals</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="your@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="Your password"
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="login-options">
        <p>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
        <p className="or-divider">or</p>
        <Link to="/guest-login" className="guest-login-link">
          Continue as Guest
        </Link>
      </div>
    </div>
  );
}

export default Login;
