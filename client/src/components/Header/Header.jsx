import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa";
import "../../styles/Home.css"; // import styles
import apiService from "../../services/api";

/**
 * Header Component
 *
 * Top navigation bar component, includes:
 * 1. Application title
 * 2. User information display (user avatar, welcome message)
 * 3. Login/logout functionality
 * 4. Guest login option
 */
export default function Header({
  user,
  loading,
  handleLogout,
  toggleProfileModal,
}) {
  const navigate = useNavigate();
  const [localUser, setLocalUser] = useState(user);
  
  // Listen for user profile updates
  useEffect(() => {
    // Subscribe to user profile updates
    const unsubscribe = apiService.userEvents.subscribe(
      'header-component',
      (updatedUser) => {
        console.log("Header received user update:", updatedUser.username);
        setLocalUser(updatedUser);
      }
    );
    
    // Initial update
    setLocalUser(user);
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  return (
    <header className="app-header">
      <h1>Focus Goal Tracker</h1>
      <div className="user-info">
        {loading ? (
          <span>Loading...</span>
        ) : localUser ? (
          <div className="logged-in-user">
            <span>Welcome, {localUser.username}</span>
            <div className="avatar-container" onClick={toggleProfileModal}>
              {localUser.avatarUrl ? (
                <img
                  src={localUser.avatarUrl}
                  alt="User Avatar"
                  className="avatar-image"
                />
              ) : (
                <FaUser className="avatar-icon" />
              )}
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <div className="guest-options">
            <button onClick={() => navigate("/login")} className="login-button">
              Login
            </button>
            <button
              onClick={() => navigate("/guest-login")}
              className="guest-button"
            >
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
