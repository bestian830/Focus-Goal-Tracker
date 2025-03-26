import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileModal from "../components/ProfileModal";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import GoalDetails from "../components/GoalDetails/GoalDetails";
import ProgressReport from "../components/ProgressReport/ProgressReport";
import apiService from "../services/api";
import "../styles/Home.css";
import "../styles/ComponentStyles.css";

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
  // State for API connection
  const [apiConnected, setApiConnected] = useState(true);

  // Navigation hook for redirecting if needed
  const navigate = useNavigate();

  // 檢查 API 連接狀態
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const isHealthy = await apiService.healthCheck();
        setApiConnected(isHealthy);
        console.log("API health check result:", isHealthy);
      } catch (error) {
        console.error("API health check failed:", error);
        setApiConnected(false);
      }
    };

    checkApiConnection();
  }, []);

  // Check if user is logged in (either as guest or registered)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      console.log("=== Start fetching user data ===");

      try {
        // Check if user ID is stored in local storage
        const userId = localStorage.getItem("userId");
        const tempId = localStorage.getItem("tempId");

        console.log("User information in localStorage:", { userId, tempId });

        if (!userId && !tempId) {
          console.log("No user information found, displaying welcome page");
          setLoading(false);
          return;
        }

        if (userId) {
          console.log("Detected registered user ID, starting to fetch user data");
          try {
            const response = await apiService.auth.getCurrentUser(userId);

            if (response.data && response.data.success) {
              console.log("Successfully fetched user data:", response.data.data);
              setUser({
                ...response.data.data,
                isGuest: false,
              });
            }
          } catch (apiError) {
            console.error("Failed to fetch user data:", apiError);
            if (apiError.response?.status === 401) {
              console.log("User not authorized, clearing local storage");
              localStorage.removeItem("userId");
              navigate("/login");
            } else {
              setUser({
                id: userId,
                username: "User",
                isGuest: false,
              });
            }
          }
        } else if (tempId) {
          console.log("Detected temporary user ID:", tempId);
          setUser({
            id: tempId,
            username: "Guest User",
            isGuest: true,
          });
        }
      } catch (error) {
        console.error("User data logic error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      // try to clear session on server
      try {
        if (user && user.isGuest) {
          // for temporary users, we do not actually delete temporary accounts
          // only clear localStorage and cookies, but keep the account in the database
          // this allows the user to return later using the same tempId
          const tempId = localStorage.getItem("tempId");
          
          if (tempId) {
            try {
              // only clear cookies without deleting the account
              await apiService.auth.logout();
            } catch (error) {
              console.error("Failed to logout temporary user:", error);
              // if error, still continue local cleanup
            }
            
            // do not remove tempId from localStorage, keep it for potential reuse
          }
        } else if (user && !user.isGuest) {
          // for registered users, call logout API
          await apiService.auth.logout();
          
          // clear userId in localStorage
          localStorage.removeItem("userId");
        }
      } catch (error) {
        console.error("Failed to logout API:", error);
        // even if API call fails, we still continue local cleanup
        if (user && !user.isGuest) {
          localStorage.removeItem("userId");
        }
      }

      // redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout process error:", error);
      // ensure local storage is cleaned up in any case and navigate to login page
      if (user && !user.isGuest) {
        localStorage.removeItem("userId");
      }
      navigate("/login");
    }
  };

  // Toggle profile modal
  const toggleProfileModal = () => {
    setShowProfileModal(!showProfileModal);
  };

  return (
    <div className="home-container">
      <Header 
        user={user} 
        loading={loading} 
        handleLogout={handleLogout} 
        toggleProfileModal={toggleProfileModal} 
      />

      <div className="main-content">
        {user ? (
          <>
            <Sidebar />
            <GoalDetails />
            <ProgressReport />
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
