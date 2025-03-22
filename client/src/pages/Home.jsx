import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css'; // We'll create this file later

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
  
  // Navigation hook for redirecting if needed
  const navigate = useNavigate();

  // Check if user is logged in (either as guest or registered)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        // 尝试获取用户ID
        const userId = localStorage.getItem('userId');
        const tempId = localStorage.getItem('tempId');
        
        if (userId) {
          // 对于注册用户，从服务器获取信息
          try {
            const response = await axios.get(`http://localhost:5050/api/auth/me/${userId}`, {
              withCredentials: true // 确保包含凭证（cookies）
            });
            
            if (response.data && response.data.success) {
              setUser({
                ...response.data.data,
                isGuest: false
              });
            }
          } catch (apiError) {
            console.error('Error fetching user data from API:', apiError);
            // 如果API调用失败，尝试使用本地存储的数据
            setUser({
              id: userId,
              username: 'User',
              isGuest: true
            });
          }
        } else if (tempId) {
          // 对于临时用户，使用本地存储数据
          setUser({
            id: tempId,
            username: 'Guest User',
            isGuest: true
          });
        }
      } catch (error) {
        console.error('Error in user data logic:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('guestUsername');
    // We keep tempId for potential future conversion
    
    // Reset user state
    setUser(null);
    
    // Redirect to login page
    navigate('/login');
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
              <span>Welcome, {user.username} {user.isGuest ? '(Guest)' : ''}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-options">
              <button onClick={() => navigate('/login')} className="login-button">
                Login
              </button>
              <button onClick={() => navigate('/guest-login')} className="guest-button">
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
                  {Array(7).fill(0).map((_, i) => (
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
            <p>Please log in or continue as a guest to start tracking your goals.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home; 