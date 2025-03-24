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
      // 尝试在服务器端清除会话
      try {
        if (user && user.isGuest) {
          // 对于临时用户，我们不实际删除临时账户
          // 仅清除localStorage和cookies，但保留数据库中的账户
          // 这允许用户稍后使用相同的tempId返回
          const tempId = localStorage.getItem("tempId");
          
          if (tempId) {
            try {
              // 仅清除cookie而不删除账户
              await axios.post(
                "http://localhost:5050/api/auth/logout",
                {},
                {
                  withCredentials: true,
                }
              );
            } catch (error) {
              console.error("临时用户登出API调用失败:", error);
              // 如果出错，仍继续本地清理
            }
            
            // 不从localStorage中移除tempId，保留以便潜在的重用
          }
        } else if (user && !user.isGuest) {
          // 对于注册用户，调用登出API
          await axios.post(
            "http://localhost:5050/api/auth/logout",
            {},
            {
              withCredentials: true,
            }
          );
          
          // 清除localStorage中的userId
          localStorage.removeItem("userId");
        }
      } catch (error) {
        console.error("API登出失败，继续执行本地登出:", error);
        // 即使API调用失败，我们也继续进行本地清理
        if (user && !user.isGuest) {
          localStorage.removeItem("userId");
        }
      }

      // 重定向到登录页面
      navigate("/login");
    } catch (error) {
      console.error("登出过程出错:", error);
      // 确保在任何情况下都能清理本地存储并导航到登录页面
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
