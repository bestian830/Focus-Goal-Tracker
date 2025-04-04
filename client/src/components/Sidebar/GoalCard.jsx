import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import apiService from '../../services/api';

export default function GoalCard({ goal, onPriorityChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [priority, setPriority] = useState(goal.priority);
  
  // Map text priority to number for display
  const priorityMap = { 
    "High": 1, 
    "Medium": 2, 
    "Low": 3 
  };

  const priorityClass = priority.toLowerCase();
  const priorityNumber = priorityMap[priority] || 2;
  
  // Handle opening priority edit menu
  const handleOpenMenu = (event) => {
    event.stopPropagation(); // Prevent triggering goal selection
    setAnchorEl(event.currentTarget);
  };
  
  // Handle closing priority edit menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // Handle priority change
  const handlePriorityChange = async (newPriority) => {
    try {
      // Close menu
      handleCloseMenu();
      
      // If priority hasn't changed, do nothing
      if (newPriority === priority) return;
      
      console.log(`Changing priority from ${priority} to ${newPriority}`);
      
      // Update goal priority through API
      await apiService.goals.update(goal._id || goal.id, {
        priority: newPriority
      });
      
      // Update local state
      setPriority(newPriority);
      
      console.log(`Priority updated successfully to ${newPriority}`);
      
      // Notify parent component that priority has changed
      if (onPriorityChange) {
        onPriorityChange(goal._id || goal.id, newPriority);
      }
    } catch (error) {
      console.error('Failed to update goal priority:', error);
    }
  };

  return (
    <div className="goal-card">
      <h5>{goal.title}</h5>
      <div className="priority-container">
        <Tooltip title={`Priority: ${priority}`} arrow>
          <span className={`priority ${priorityClass}`}>
            {priorityNumber}
          </span>
        </Tooltip>
        
        <IconButton 
          size="small" 
          className="edit-priority-btn"
          onClick={handleOpenMenu}
          aria-label="Edit priority"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handlePriorityChange("High")}>
            Priority: 1 (High)
          </MenuItem>
          <MenuItem onClick={() => handlePriorityChange("Medium")}>
            Priority: 2 (Medium)
          </MenuItem>
          <MenuItem onClick={() => handlePriorityChange("Low")}>
            Priority: 3 (Low)
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
