import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileModal from "../components/ProfileModal";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import GoalDetails from "../components/GoalDetails/GoalDetails";
import ProgressReport from "../components/ProgressReport/ProgressReport";
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
        // For guest users, we don't actually delete the temporary account
        // Just clear localStorage and cookies, but keep the account in database
        // This allows the user to come back later using the same tempId
        const tempId = localStorage.getItem("tempId");
        
        if (tempId) {
          try {
            // Instead of deleting, just clear the cookie
            await axios.post(
              "http://localhost:5050/api/auth/logout",
              {},
              {
                withCredentials: true,
              }
            );
          } catch (error) {
            console.error("Error during guest logout:", error);
            // If there's an error, we'll still continue with local cleanup
          }
          
          // Don't remove tempId from localStorage, keep it for potential reuse
          // Just clear the cookie which will happen via the logout API call
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

        // Clear userId from localStorage
        localStorage.removeItem("userId");
      }

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      // Only clear userId in case of error, preserve tempId
      localStorage.removeItem("userId");
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
