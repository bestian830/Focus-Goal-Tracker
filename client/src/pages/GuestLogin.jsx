import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";
import styles from "./GuestLogin.module.css";

/**
 * GuestLogin Component
 * 
 * This component:
 * 1. Provides a streamlined entry point for users who don't want to create an account
 * 2. Creates a temporary account with localStorage storage only
 * 3. Stores a temporary ID in localStorage
 * 
 * Route: /guest-login
 */
function GuestLogin() {
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Navigation hook
  const navigate = useNavigate();
  
  /**
   * Handle guest login process
   */
  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      // check if tempId exists in localStorage
      const existingTempId = localStorage.getItem('tempId');
      console.log('检查localStorage中的tempId:', existingTempId);
      
      // whether there is an existing tempId, send a request to the backend
      // if there is an existing tempId, pass it to the backend for verification
      const requestData = existingTempId ? { existingTempId } : {};
      
      const response = await apiService.auth.createTempUser(requestData);
      
      if (response.data && response.data.success) {
        // Store the tempId in localStorage
        localStorage.setItem('tempId', response.data.data.tempId);
        
        console.log('Using temporary user with ID:', response.data.data.tempId);
        
        // Redirect to the home page
        navigate('/');
      } else {
        setError(response.data?.error?.message || "Guest login failed. Please try again.");
      }
    } catch (err) {
      console.error("Guest login error:", err);
      setError(
        err.response?.data?.error?.message || 
        "Could not create guest account. Please try again or register."
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.guestLoginContainer}>
      <h1 className={styles.appTitle}>Welcome to Focus</h1>
      <p className={styles.subtitle}>Track your goals, boost productivity, and achieve more every day</p>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <button 
        className={styles.guestLoginButton}
        onClick={handleGuestLogin}
        disabled={loading}
      >
        {loading ? 'Setting up guest access...' : 'Enter as Guest'}
      </button>
      
      <div className={styles.loginOptions}>
        <p className={styles.orDivider}>Or</p>
        <div className={styles.authLinks}>
          <Link to="/login" className={styles.authLink}>
            Login
          </Link>
          <span className={styles.separator}>|</span>
          <Link to="/register" className={styles.authLink}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GuestLogin; 