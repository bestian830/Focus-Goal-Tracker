import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import apiService from '../services/api';
import '../styles/GuestLogin.css'; // We'll create this file later

/**
 * GuestLogin Component
 * 
 * This component:
 * 1. Displays a welcome page with a "Enter as Guest" button
 * 2. When the button is clicked, it calls the backend API to create a temporary user
 * 3. Stores the returned tempId in localStorage
 * 4. Navigates to the home page
 * 
 * Route: /guest-login
 * Next route: / (after successful login)
 */
function GuestLogin() {
  // State to track if login request is in progress
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  
  // Navigation hook to redirect after login
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    // Only check for userId here, not tempId, since this is the guest login page
    // and we want to allow users to get a new tempId if they want
    
    // If userId exists, redirect to home page
    if (userId) {
      console.log("User already logged in as registered user, redirecting to home page");
      navigate("/");
    }
  }, [navigate]);

  /**
   * Handle guest login button click
   * Calls the backend API to create a temporary user
   */
  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // check if tempId exists in localStorage
      const existingTempId = localStorage.getItem('tempId');
      console.log('检查localStorage中的tempId:', existingTempId);
      
      // whether there is an existing tempId, send a request to the backend to decide whether to return the existing user or create a new user
      // if there is an existing tempId, pass it to the backend for verification
      const requestData = existingTempId ? { existingTempId } : {};
      
      const response = await apiService.auth.createTempUser(requestData);
      
      // For debugging purposes
      setApiResponse(response.data);
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        // Store the tempId in localStorage
        localStorage.setItem('tempId', response.data.data.tempId);
        
        console.log('Using temporary user with ID:', response.data.data.tempId);
        
        // Redirect to the home page after a short delay to ensure localStorage is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        throw new Error(response.data?.error?.message || 'Failed to create temporary user');
      }
    } catch (error) {
      console.error('Failed to create temporary session:', error);
      setError('Login failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-login-container">
      <h1>Welcome to Focus</h1>
      <p className="subtitle">Track your goals, boost productivity</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        className="guest-login-button"
        onClick={handleGuestLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Enter as Guest'}
      </button>
      
      <div className="login-options">
        <p className="or-divider">Or</p>
        <div className="auth-links">
          <Link to="/login" className="auth-link">
            Login
          </Link>
          <span className="separator">|</span>
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GuestLogin; 