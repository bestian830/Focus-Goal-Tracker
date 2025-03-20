import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css'; // We'll create this file later

/**
 * Home Component
 * 
 * This component:
 * 1. Fetches the current user information using the ID stored in localStorage
 * 2. Displays a welcome message and the Goal Tracker interface
 * 3. Shows placeholder content for goals (to be implemented in future iterations)
 * 
 * Route: /home
 * Previous route: / (GuestLogin)
 */
function Home() {
  // State for user data and loading status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation hook for redirecting if needed
  const navigate = useNavigate();

  // Effect to fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      // Get userId from localStorage (set during login)
      const userId = localStorage.getItem('userId');
      
      // If no userId is found, redirect to login page
      if (!userId) {
        navigate('/');
        return;
      }
      
      try {
        // Fetch user information from backend API
        const response = await axios.get(`http://localhost:5050/api/auth/me/${userId}`);
        setUser(response.data.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Error state
  if (error) {
    return <div className="error">{error}</div>;
  }

  // If user not found (should not happen due to redirect in useEffect)
  if (!user) {
    return <div className="error">User not found. Please log in again.</div>;
  }

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>Goal Tracker</h1>
        <div className="user-info">
          <span>Welcome, {user.username}</span>
        </div>
      </header>
      
      <div className="main-content">
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
      </div>
    </div>
  );
}

export default Home; 