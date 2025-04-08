import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa";
import "../../styles/Home.css"; // import styles

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

  return (
    <header className="app-header">
      <h1>Focus Goal Tracker</h1>
      <div className="user-info">
        {loading ? (
          <span>Loading...</span>
        ) : user ? (
          <div className="logged-in-user">
            <span>Welcome, {user.username}</span>
            <div className="avatar-container" onClick={toggleProfileModal}>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
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
