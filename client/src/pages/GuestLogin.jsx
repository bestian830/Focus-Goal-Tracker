import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/GuestLogin.css'; // We'll create this file later

/**
 * GuestLogin Component
 * 
 * This component:
 * 1. Displays a welcome page with a "Enter as Guest" button
 * 2. When the button is clicked, it calls the backend API to create a guest user
 * 3. Stores the returned user ID in localStorage
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
   * Calls the backend API to create a guest user
   */
  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call the backend API to create a guest user
      const response = await axios.post('http://localhost:5050/api/auth/guest');
      
      // For debugging purposes
      setApiResponse(response.data);
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        // Store the user ID in localStorage
        localStorage.setItem('userId', response.data.data.id);
        
        // Also store username for display purposes
        localStorage.setItem('guestUsername', response.data.data.username);
        
        console.log('Created guest user with ID:', response.data.data.id);
        
        // Redirect to the home page after a short delay to ensure localStorage is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        throw new Error(response.data?.error?.message || 'Failed to create guest user');
      }
    } catch (error) {
      console.error('Failed to create guest session:', error);
      setError('登入失敗。請嘗試使用"前往主頁"按鈕或稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual navigation
  const handleManualNavigation = () => {
    // If we have a successful API response but navigation failed, try to use that
    if (apiResponse?.success && apiResponse?.data?.id) {
      localStorage.setItem('userId', apiResponse.data.id);
      localStorage.setItem('guestUsername', apiResponse.data.username);
    } else {
      // Fallback to client-side guest ID generation
      const guestId = `guest_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('userId', guestId);
      localStorage.setItem('guestUsername', guestId);
    }
    
    navigate('/', { replace: true });
  };

  return (
    <div className="guest-login-container">
      <h1>歡迎使用 Focus</h1>
      <p className="subtitle">追蹤你的目標，提高生產力</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        className="guest-login-button"
        onClick={handleGuestLogin}
        disabled={loading}
      >
        {loading ? '登入中...' : '以訪客身份進入'}
      </button>
      
      <div className="login-options">
        <p className="or-divider">或</p>
        <div className="auth-links">
          <Link to="/login" className="auth-link">
            登入
          </Link>
          <span className="separator">|</span>
          <Link to="/register" className="auth-link">
            註冊
          </Link>
        </div>
        
        {/* Backup navigation button */}
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={handleManualNavigation}
            className="debug-button"
          >
            前往主頁
          </button>
          <p className="debug-text">(如果自動跳轉不起作用，請使用此按鈕)</p>
        </div>
      </div>
    </div>
  );
}

export default GuestLogin; 