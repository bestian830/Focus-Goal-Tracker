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
  // 选中的目标ID
  const [selectedGoalId, setSelectedGoalId] = useState(null);

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

  // 获取用户目标
  const fetchUserGoals = async (id, isGuest) => {
    try {
      if (!id) {
        console.log("No user ID provided for fetchUserGoals");
        setShowOnboarding(true);
        return [];
      }

      console.log(`Fetching goals for user ${id}, isGuest: ${isGuest}`);
      
      try {
        const response = await apiService.goals.getUserGoals(id);
        console.log("User goals API response:", response);
        
        if (response.data && response.data.success) {
          const goals = response.data.data || [];
          setUserGoals(goals);
          
          // 如果用户没有目标，显示引导流程
          if (goals.length === 0) {
            console.log("User has no goals, showing onboarding");
            setShowOnboarding(true);
          } else {
            console.log(`User has ${goals.length} goals`);
            setShowOnboarding(false);
          }
          
          return goals;
        } else {
          console.warn("API response success is false:", response);
          setShowOnboarding(true);
          return [];
        }
      } catch (apiError) {
        console.error("Failed to fetch user goals:", apiError);
        // 如果API调用失败，也显示引导流程
        setShowOnboarding(true);
        setUserGoals([]);
        return [];
      }
    } catch (error) {
      console.error("Error in fetchUserGoals:", error);
      setShowOnboarding(true);
      setUserGoals([]);
      return [];
    }
  };

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
              
              // 获取用户目标
              await fetchUserGoals(userId, false);
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
              
              // 获取用户目标
              await fetchUserGoals(userId, false);
            }
          }
        } else if (tempId) {
          console.log("Detected temporary user ID:", tempId);
          setUser({
            id: tempId,
            username: "Guest User",
            isGuest: true,
          });
          
          // 获取临时用户目标
          await fetchUserGoals(tempId, true);
        }
      } catch (error) {
        console.error("User data logic error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // 設置定期刷新機制，每 30 秒從後端獲取一次最新目標數據
    const refreshInterval = setInterval(() => {
      if (user) {
        console.log("Running scheduled refresh of goals data");
        const userId = user.id || user._id;
        fetchUserGoals(userId, user?.isGuest || false).catch(err => {
          console.error("Scheduled refresh failed:", err);
        });
      }
    }, 30000); // 每 30 秒刷新一次

    return () => {
      // 組件卸載時清除定時器
      clearInterval(refreshInterval);
    };
  }, [navigate]);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      // try to clear session on server
      try {
        if (user && user.isGuest) {
          // 对于临时用户，我们不实际删除临时账户
          // 仅清除cookies，但保留localStorage中的tempId
          // 这允许用户稍后使用相同的tempId返回
          const tempId = localStorage.getItem("tempId");
          
          if (tempId) {
            try {
              // only clear cookies without deleting the account
              await apiService.auth.logout();
            } catch (error) {
              console.error("Failed to logout temporary user:", error);
              // if error, still continue local cleanup
            }
            
            // 不从localStorage中移除tempId，保留以便用户可以再次使用相同的临时ID
            console.log("保留临时用户ID以便再次使用:", tempId);
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

  // 处理引导完成
  const handleOnboardingComplete = async (newGoal) => {
    console.log("Onboarding complete, new goal created:", newGoal);
    setShowOnboarding(false);
    
    // 立即刷新目標列表而不是簡單地添加新目標
    if (user) {
      console.log("Refreshing goals list after new goal creation");
      const userId = user.id || user._id;
      await fetchUserGoals(userId, user.isGuest);
      
      // 選擇新創建的目標
      if (newGoal && (newGoal._id || newGoal.id)) {
        setSelectedGoalId(newGoal._id || newGoal.id);
      }
    } else {
      console.warn("User information not available, cannot refresh goals");
      // 如果沒有用戶信息，至少將新目標添加到列表中
      setUserGoals(prev => [...prev, newGoal]);
      
      // 選擇新創建的目標
      if (newGoal && (newGoal._id || newGoal.id)) {
        setSelectedGoalId(newGoal._id || newGoal.id);
      }
    }
  };

  // 关闭引导模态框
  const handleCloseOnboarding = () => {
    console.log("Onboarding modal closed");
    setShowOnboarding(false);
  };

  // 处理从侧边栏选择目标
  const handleGoalSelect = (goalId) => {
    console.log("Goal selected:", goalId);
    setSelectedGoalId(goalId);
  };

  // Reset goals state and UI
  const resetGoals = () => {
    console.log("Resetting goals state");
    setUserGoals([]);
    setSelectedGoalId(null);
    
    // 如果用戶沒有目標，顯示引導流程
    if (user) {
      console.log("No goals, showing onboarding modal");
      setShowOnboarding(true);
    }
  };

  // Add handleGoalDeleted method to update goals after deletion
  const handleGoalDeleted = async (deletedGoalId) => {
    console.log(`Goal deleted, updating goals list. Deleted ID: ${deletedGoalId}`);
    
    // 暫時移除刪除的目標（用於立即反饋）
    const updatedGoals = userGoals.filter(g => (g._id || g.id) !== deletedGoalId);
    setUserGoals(updatedGoals);
    
    // 檢查是否刪除了最後一個目標
    const isLastGoal = updatedGoals.length === 0;
    
    // 從後端重新獲取完整的目標列表（確保與數據庫同步）
    if (user) {
      console.log("Refreshing goals list after deletion");
      const userId = user.id || user._id;
      try {
        const goals = await fetchUserGoals(userId, user.isGuest);
        console.log("Goals list refreshed successfully after deletion, count:", goals.length);
        
        // 如果沒有目標了，重置狀態
        if (goals.length === 0) {
          resetGoals();
          return; // 不繼續執行
        }
      } catch (error) {
        console.error("Failed to refresh goals after deletion:", error);
        
        // 如果API調用失敗但我們的本地狀態顯示沒有目標了，仍然重置
        if (isLastGoal) {
          resetGoals();
          return;
        }
      }
    } else if (isLastGoal) {
      // 如果沒有用戶信息但是刪除了最後一個目標，也需要重置
      resetGoals();
      return;
    }
    
    // 如果被刪除的目標是當前選中的目標，選擇另一個目標
    if (selectedGoalId === deletedGoalId) {
      setTimeout(() => {
        if (userGoals.length > 1) {
          // 尋找下一個可選擇的目標
          const remainingGoals = userGoals.filter(g => (g._id || g.id) !== deletedGoalId);
          if (remainingGoals.length > 0) {
            console.log("Selecting another goal after deletion:", remainingGoals[0]._id || remainingGoals[0].id);
            setSelectedGoalId(remainingGoals[0]._id || remainingGoals[0].id);
          } else {
            console.log("No goals remaining after deletion, clearing selection");
            setSelectedGoalId(null);
          }
        } else {
          console.log("No goals remaining after deletion, clearing selection");
          setSelectedGoalId(null);
        }
      }, 100); // 給予一些時間讓 userGoals 狀態更新
    }
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
            <Sidebar 
              onGoalSelect={handleGoalSelect} 
              goals={userGoals}
            />
            <GoalDetails 
              goals={userGoals} 
              goalId={selectedGoalId}
              onGoalDeleted={handleGoalDeleted} 
            />
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
