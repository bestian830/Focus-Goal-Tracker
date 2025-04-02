import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileModal from "../components/ProfileModal";
import OnboardingModal from "../components/OnboardingModal";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import GoalDetails from "../components/GoalDetails/GoalDetails";
import ProgressReport from "../components/ProgressReport/ProgressReport";
import apiService from "../services/api";
import "../styles/Home.css";

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
  // State for onboarding modal
  const [showOnboarding, setShowOnboarding] = useState(false);
  // State for user goals
  const [userGoals, setUserGoals] = useState([]);

  // Navigation hook for redirecting if needed
  const navigate = useNavigate();

  // 檢查 API 連接狀態
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const isHealthy = await apiService.healthCheck();
        setApiConnected(isHealthy);
        console.log("API 健康檢查結果:", isHealthy);
      } catch (error) {
        console.error("API 健康檢查失敗:", error);
        setApiConnected(false);
      }
    };

    checkApiConnection();
  }, []);

  // 获取用户目标
  const fetchUserGoals = async (id, isGuest) => {
    try {
      if (!id) return;

      const response = await apiService.goals.getUserGoals(id);
      if (response.data && response.data.success) {
        setUserGoals(response.data.data);

        // 如果用户没有目标，显示引导流程
        if (response.data.data.length === 0) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error("获取用户目标失败:", error);
    }
  };

  // Check if user is logged in (either as guest or registered)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      console.log("=== 開始獲取用戶數據 ===");

      try {
        // Check if user ID is stored in local storage
        const userId = localStorage.getItem("userId");
        const tempId = localStorage.getItem("tempId");

        console.log("localStorage 中的用戶信息:", { userId, tempId });

        if (!userId && !tempId) {
          console.log("未找到用戶信息，顯示歡迎頁面");
          setLoading(false);
          return;
        }

        if (userId) {
          console.log("檢測到註冊用戶ID，開始獲取用戶數據");
          try {
            const response = await apiService.auth.getCurrentUser(userId);

            if (response.data && response.data.success) {
              console.log("成功獲取用戶數據:", response.data.data);
              setUser({
                ...response.data.data,
                isGuest: false,
              });
              
              // 获取用户目标
              await fetchUserGoals(userId, false);
            }
          } catch (apiError) {
            console.error("獲取用戶數據失敗:", apiError);
            if (apiError.response?.status === 401) {
              console.log("用戶未授權，清除本地存儲");
              localStorage.removeItem("userId");
              navigate("/login");
            } else {
              setUser({
                id: userId,
                username: "User",
                isGuest: false,
              });
              
              // 获取用户目标
              await fetchUserGoals(userId, false);
            }
          }
        } else if (tempId) {
          console.log("檢測到臨時用戶ID:", tempId);
          setUser({
            id: tempId,
            username: "Guest User",
            isGuest: true,
          });
          
          // 获取临时用户目标
          await fetchUserGoals(tempId, true);
        }
      } catch (error) {
        console.error("用戶數據邏輯錯誤:", error);
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
      // 尝试在服务器端清除会话
      try {
        if (user && user.isGuest) {
          // 对于临时用户，我们不实际删除临时账户
          // 仅清除cookies，但保留localStorage中的tempId
          // 这允许用户稍后使用相同的tempId返回
          const tempId = localStorage.getItem("tempId");
          
          if (tempId) {
            try {
              // 仅清除cookie而不删除账户
              await apiService.auth.logout();
            } catch (error) {
              console.error("临时用户登出API调用失败:", error);
              // 如果出错，仍继续本地清理
            }
            
            // 不从localStorage中移除tempId，保留以便用户可以再次使用相同的临时ID
            console.log("保留临时用户ID以便再次使用:", tempId);
          }
        } else if (user && !user.isGuest) {
          // 对于注册用户，调用登出API
          await apiService.auth.logout();
          
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

  // 处理引导完成
  const handleOnboardingComplete = (newGoal) => {
    setShowOnboarding(false);
    setUserGoals([...userGoals, newGoal]);
  };

  // 关闭引导模态框
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
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
            <GoalDetails goals={userGoals} />
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

      {/* Onboarding Modal */}
      {user && (
        <OnboardingModal
          open={showOnboarding}
          onClose={handleCloseOnboarding}
          userId={user.id}
          isGuest={user.isGuest}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  );
}

export default Home;
