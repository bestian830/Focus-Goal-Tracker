import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/GuestLogin.css'; // We'll create this file later

/**
 * GuestLogin Component
 * 
 * This component:
 * 1. Displays a welcome page with a "Enter as Guest" button
 * 2. When the button is clicked, it generates a temporary guest ID
 * 3. Stores the ID in localStorage
 * 4. Navigates to the home page
 * 
 * Route: /guest-login
 * Next route: / (after successful login)
 */
function GuestLogin() {
  // State to track if login request is in progress
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Navigation hook to redirect after login
  const navigate = useNavigate();

  /**
   * Generate a random guest ID 
   * @returns {string} random guest ID with prefix
   */
  const generateGuestId = () => {
    return `guest_${Math.random().toString(36).substring(2, 10)}`;
  };

  /**
   * Handle guest login button click
   * Creates a temporary guest ID without making an API call
   */
  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Generate a guest ID directly in the client
      // This simulates what the backend would normally do
      const guestId = generateGuestId();
      
      // Store the user ID in localStorage
      localStorage.setItem('userId', guestId);
      
      // Also store as tempId for potential future migration to registered account
      localStorage.setItem('tempId', guestId);
      
      // Set a guest username in localStorage so Home component can display it
      localStorage.setItem('guestUsername', guestId);
      
      console.log('Created guest user with ID:', guestId);
      
      // Redirect to the home page
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Failed to create guest session:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual navigation
  const handleManualNavigation = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="guest-login-container">
      <h1>Welcome to Focus</h1>
      <p className="subtitle">Track your goals and improve productivity</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        className="guest-login-button"
        onClick={handleGuestLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Enter as Guest'}
      </button>
      
      <div className="login-options">
        <p className="or-divider">or</p>
        <div className="auth-links">
          <Link to="/login" className="auth-link">
            Log In
          </Link>
          <span className="separator">|</span>
          <Link to="/register" className="auth-link">
            Sign Up
          </Link>
        </div>
        
        {/* Temporary debug button */}
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleManualNavigation}
            className="debug-button"
          >
            Go to Home Page
          </button>
          <p className="debug-text">(Use this button if automatic redirect doesn't work)</p>
        </div>
      </div>
    </div>
  );
}

export default GuestLogin; 