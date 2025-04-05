import React, { useState, useEffect } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import apiService from '../../services/api';

export default function GoalCard({ goal, onPriorityChange }) {
  // 增強的安全檢查，確保 goal 是有效對象
  if (!goal || typeof goal !== 'object') {
    console.error("Invalid goal object received by GoalCard:", goal);
    return (
      <div className="goal-card error">
        <h5>Invalid Goal Data</h5>
      </div>
    );
  }

  // 詳細的日誌記錄，幫助調試
  console.log("Rendering GoalCard for:", {
    id: goal._id || goal.id,
    title: goal.title,
    priority: goal.priority,
    status: goal.status
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [priority, setPriority] = useState(goal.priority || "Medium");
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // 當目標屬性變化時更新本地狀態
  useEffect(() => {
    if (goal.priority && goal.priority !== priority && hasLoaded) {
      console.log(`Updating priority state from ${priority} to ${goal.priority}`);
      setPriority(goal.priority);
    } else {
      setHasLoaded(true);
    }
  }, [goal.priority, priority, hasLoaded]);
  
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
      
      // 確保有 goal id
      const goalId = goal._id || goal.id;
      if (!goalId) {
        console.error("Cannot update priority: missing goal ID");
        return;
      }
      
      // 先更新本地狀態提供快速反饋
      setPriority(newPriority);
      
      // 通知父組件優先級已變更 (先用舊數據進行初步更新)
      if (onPriorityChange) {
        onPriorityChange(goalId, newPriority);
      }
      
      // Update goal priority through API
      try {
        const response = await apiService.goals.update(goalId, {
          priority: newPriority
        });
        console.log(`Priority updated successfully to ${newPriority}`, response);
        
        // 如果 API 返回更新後的數據，再次通知父組件
        if (response && response.data && response.data.success && response.data.data) {
          // 通知父組件更新後的目標數據，觸發重新渲染
          if (onPriorityChange) {
            onPriorityChange(goalId, newPriority, response.data.data);
          }
        }
      } catch (apiError) {
        console.error('API failed to update goal priority:', apiError);
        // 回滾本地狀態
        setPriority(priority);
        // 通知父組件優先級更新失敗
        if (onPriorityChange) {
          onPriorityChange(goalId, priority);
        }
      }
    } catch (error) {
      console.error('Failed to update goal priority:', error);
    }
  };

  // 安全獲取標題和狀態
  const goalTitle = goal.title || "Unnamed Goal";
  const goalStatus = goal.status || "active";

  return (
    <div className={`goal-card ${goalStatus}`}>
      <h5>{goalTitle}</h5>
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
