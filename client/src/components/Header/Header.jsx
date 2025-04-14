import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import "../../styles/Home.css"; // import styles
import apiService from "../../services/api";
import { useUserStore } from "../../store/userStore";

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
  
  // Use Zustand store for user data - with fallback to props
  const storeUser = useUserStore(state => state.user);
  const isStoreLoading = useUserStore(state => state.isLoading);
  
  // Determine which user data to display (prefer Zustand store if available)
  const displayUser = storeUser || user;
  const isLoading = isStoreLoading || loading;

  return (
    <header className="app-header" style={{ backgroundColor: "#f5f7fa", borderBottom: "1px solid #e0e0e0" }}>
      <h1 style={{ color: "#0D5E6D" }}>Focus Goal Tracker</h1>
      <div className="user-info">
        {isLoading ? (
          <span>Loading...</span>
        ) : displayUser ? (
          <div className="logged-in-user">
            <span style={{ color: "#333" }}>Welcome, {displayUser.username}</span>
            <div 
              className="avatar-container" 
              onClick={toggleProfileModal}
              style={{ 
                backgroundColor: "rgba(13, 94, 109, 0.1)",
                border: "1px solid rgba(13, 94, 109, 0.2)"
              }}
            >
              {displayUser.avatarUrl ? (
                <img
                  src={displayUser.avatarUrl}
                  alt="User Avatar"
                  className="avatar-image"
                />
              ) : (
                <FaUser className="avatar-icon" style={{ color: "#0D5E6D" }} />
              )}
            </div>
            <button 
              onClick={handleLogout} 
              className="logout-button"
              style={{ 
                backgroundColor: "#f44336",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="guest-options">
            <button 
              onClick={() => navigate("/login")} 
              className="login-button"
              style={{ 
                backgroundColor: "#0D5E6D",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "0.5rem"
              }}
            >
              Login
            </button>
            <button
              onClick={() => navigate("/guest-login")}
              className="guest-button"
              style={{ 
                backgroundColor: "#4CD7D0",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Continue as Guest
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
