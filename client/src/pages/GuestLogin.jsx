import { useState } from 'react';
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
      setError('Login failed. Please try using the "前往主頁" button or try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual navigation
  const handleManualNavigation = () => {
    // check if tempId exists in localStorage
    const existingTempId = localStorage.getItem('tempId');
      
    if (existingTempId) {
      // if there is an existing tempId, use it and redirect
      console.log('Using existing temporary user ID (manual navigation):', existingTempId);
      navigate('/', { replace: true });
      return;
    }
    
    // if we have a successful API response but navigation failed, try to use that
    if (apiResponse?.success && apiResponse?.data?.tempId) {
      localStorage.setItem('tempId', apiResponse.data.tempId);
    } else {
      // fallback to client-side temp ID generation
      const tempId = `temp_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('tempId', tempId);
    }
    
    navigate('/', { replace: true });
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
        
        {/* Backup navigation button */}
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleManualNavigation}
            className="debug-button"
          >
            Go to Home
          </button>
            <p className="debug-text">(If the automatic redirect does not work, please use this button)</p>
        </div>
      </div>
    </div>
  );
}

export default GuestLogin; 