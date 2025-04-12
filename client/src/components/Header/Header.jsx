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
    <header className="app-header">
      <h1>Focus Goal Tracker</h1>
      <div className="user-info">
        {isLoading ? (
          <span>Loading...</span>
        ) : displayUser ? (
          <div className="logged-in-user">
            <span>Welcome, {displayUser.username}</span>
            <div className="avatar-container" onClick={toggleProfileModal}>
              {displayUser.avatarUrl ? (
                <img
                  src={displayUser.avatarUrl}
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
