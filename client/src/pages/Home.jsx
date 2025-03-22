import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa";
import ProfileModal from "../components/ProfileModal";
import "../styles/Home.css"; // We'll create this file later

/**
 * Home Component
 *
 * This component:
 * 1. Displays the Goal Tracker interface
 * 2. Shows placeholder content for goals (to be implemented in future iterations)
 * 3. Displays user information if logged in
 * 4. Provides logout functionality
 *
 * Route: /home or /
 */
function Home() {
  // State for user information
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // State for profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Navigation hook for redirecting if needed
  const navigate = useNavigate();

  // Check if user is logged in (either as guest or registered)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      try {
        // Check if user ID is stored in local storage
        const userId = localStorage.getItem("userId");
        const tempId = localStorage.getItem("tempId");

        if (userId) {
          // For registered users, fetch user data from the API (axios)
          try {
            const response = await axios.get(
              `http://localhost:5050/api/auth/me/${userId}`,
              {
                withCredentials: true, // Send cookies with the request
              }
            );

            if (response.data && response.data.success) {
              setUser({
                ...response.data.data,
                isGuest: false,
              });
            }
          } catch (apiError) {
            console.error("Error fetching user data from API:", apiError);
            // If there's an error, we'll fall back to using local storage
            setUser({
              id: userId,
              username: "User",
              isGuest: false,
            });
          }
        } else if (tempId) {
          //  For guest users, set user data with temporary ID
          setUser({
            id: tempId,
            username: "Guest User",
            isGuest: true,
          });
        }
      } catch (error) {
        console.error("Error in user data logic:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      if (user.isGuest) {
        // For guest users, delete the temporary account
        const tempId = localStorage.getItem("tempId");

        if (tempId) {
          try {
            // Call the API to delete the temporary account
            await axios.delete(
              `http://localhost:5050/api/temp-users/${tempId}`,
              {
                withCredentials: true,
              }
            );
          } catch (error) {
            console.error("Error deleting temporary account:", error);
            // If there's an error, we'll still clear local storage
          }

          // Clear local storage
          localStorage.removeItem("tempId");
        }
      } else {
        // For registered users, call the logout API
        await axios.post(
          "http://localhost:5050/api/auth/logout",
          {},
          {
            withCredentials: true,
          }
        );

        // Clear local storage
        localStorage.removeItem("userId");
      }

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      // Clear local storage in case of error
      localStorage.removeItem("userId");
      localStorage.removeItem("tempId");
      navigate("/login");
    }
  };

  // Toggle profile modal
  const toggleProfileModal = () => {
    setShowProfileModal(!showProfileModal);
  };

  return (
    <div className="home-container">
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
                  <img src={user.avatarUrl} alt="User Avatar" className="avatar-image" />
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
              <button
                onClick={() => navigate("/login")}
                className="login-button"
              >
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

      <div className="main-content">
        {user ? (
          <>
            <div className="goal-list-section">
              <div className="section-header">
                <h2>My Goals</h2>
                <button className="add-goal-button">Add Goal</button>
              </div>

              {/* Placeholder for goal list - will be implemented in future iterations */}
              <div className="goal-placeholder">
                <p>No goals yet. Click "Add Goal" to create your first goal!</p>
              </div>
            </div>

            <div className="goal-details-section">
              <h2>Goal Details</h2>
              <div className="details-placeholder">
                <p>Select a goal to see its details</p>
              </div>

              {/* Placeholder for progress timeline */}
              <h3>Progress Timeline</h3>
              <div className="timeline-placeholder">
                {/* Will be implemented in future iterations */}
                <div className="timeline-bar">
                  {Array(7)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="timeline-day"></div>
                    ))}
                </div>
              </div>

              {/* Placeholder for daily tasks */}
              <h3>Daily Tasks</h3>
              <div className="tasks-placeholder">
                <label className="task-item">
                  <input type="checkbox" disabled />
                  Sample Task 1
                </label>
                <label className="task-item">
                  <input type="checkbox" disabled />
                  Sample Task 2
                </label>
              </div>
            </div>
          </>
        ) : (
          <div className="welcome-message">
            <h2>Welcome to Focus</h2>
            <p>
              Please log in or continue as a guest to start tracking your goals.
            </p>
          </div>
        )}
      </div>

      {!loading && user && (
        <div className="home-header">
          <h1 className="welcome-text">
            {user.isGuest ? "歡迎，訪客用戶！" : `歡迎，${user.username}！`}
          </h1>

          <div className="user-actions">
            <button className="logout-btn" onClick={handleLogout}>
              {user.isGuest ? "返回" : "登出"}
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {user && (
        <ProfileModal 
          isOpen={showProfileModal} 
          onClose={toggleProfileModal} 
          user={user} 
        />
      )}
    </div>
  );
}

export default Home;
