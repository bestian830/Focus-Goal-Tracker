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
 * 
 * Route: /home or /
 */
function Home() {
  // Navigation hook for redirecting if needed
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="app-header">
        <h1>Goal Tracker</h1>
        <div className="user-info">
          <span>Welcome, Guest</span>
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