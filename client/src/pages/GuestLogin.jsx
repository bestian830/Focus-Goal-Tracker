import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/GuestLogin.css'; // We'll create this file later

/**
 * GuestLogin Component
 * 
 * This component:
 * 1. Displays a welcome page with a "Enter as Guest" button
 * 2. When the button is clicked, it calls the backend API to create a guest user
 * 3. Stores the user ID in localStorage
 * 4. Navigates to the home page
 * 
 * Route: / (root path)
 * Next route: /home (after successful login)
 */
function GuestLogin() {
  // State to track if login request is in progress
  const [loading, setLoading] = useState(false);
  
  // Navigation hook to redirect after login
  const navigate = useNavigate();

  /**
   * Handle guest login button click
   * Makes API request to create a guest user
   */
  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      // Call the backend API to create a guest user
      // The API will return the user information including ID
      const response = await axios.post('http://localhost:5050/api/auth/guest');
      
      // Store the user ID in localStorage for later use
      // This ID will be used to fetch user data and associate goals with this user
      localStorage.setItem('userId', response.data.data.id);
      
      // Redirect to the home page
      navigate('/home');
    } catch (error) {
      console.error('Failed to login as guest:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-login-container">
      <h1>Welcome to Focus</h1>
      <p className="subtitle">Track your goals and improve productivity</p>
      
      <button 
        className="guest-login-button"
        onClick={handleGuestLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Enter as Guest'}
      </button>
    </div>
  );
}

export default GuestLogin; 