import React, { useState, useEffect } from 'react';
import { IconButton, Menu, MenuItem, Tooltip, Typography, Box, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import apiService from '../../services/api';

export default function GoalCard({ goal, onPriorityChange, onDateClick }) {
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
    status: goal.status,
    targetDate: goal.targetDate || goal.dueDate
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [priority, setPriority] = useState(goal.priority || "Medium");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [targetDate, setTargetDate] = useState(
    goal.targetDate ? new Date(goal.targetDate) : 
    goal.dueDate ? new Date(goal.dueDate) : null
  );
  
  // 當目標屬性變化時更新本地狀態
  useEffect(() => {
    if (goal.priority && goal.priority !== priority && hasLoaded) {
      console.log(`Updating priority state from ${priority} to ${goal.priority}`);
      setPriority(goal.priority);
    } else {
      setHasLoaded(true);
    }
    
    // 更新目標日期
    const newDate = goal.targetDate || goal.dueDate;
    if (newDate && (!targetDate || new Date(newDate).getTime() !== targetDate.getTime())) {
      setTargetDate(new Date(newDate));
    }
  }, [goal.priority, priority, hasLoaded, goal.targetDate, goal.dueDate, targetDate]);
  
  // 優先級映射 - 文字到顯示數字
  const priorityMap = { 
    "High": 1, 
    "Medium": 2, 
    "Low": 3 
  };

  const priorityClass = priority.toLowerCase();
  const priorityNumber = priorityMap[priority] || 2;
  
  // 處理打開優先級編輯菜單
  const handleOpenMenu = (event) => {
    event.stopPropagation(); // 防止觸發目標選擇
    setAnchorEl(event.currentTarget);
  };
  
  // 處理關閉優先級編輯菜單
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // 處理優先級更改
  const handlePriorityChange = async (newPriority) => {
    try {
      // 關閉菜單
      handleCloseMenu();
      
      // 如果優先級沒有變化，不做任何事情
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
      
      // 通過 API 更新目標優先級
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

  // 處理日期點擊
  const handleDateClick = (event) => {
    event.stopPropagation(); // 防止觸發目標選擇
    if (onDateClick) {
      onDateClick(event, targetDate);
    }
  };

  // 安全獲取標題和狀態
  const goalTitle = goal.title || "Unnamed Goal";
  const goalStatus = goal.status || "active";

  // 格式化日期顯示
  const formatDate = (date) => {
    if (!date) return "設定截止日期";
    
    try {
      return new Date(date).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "無效日期";
    }
  };

  return (
    <div className={`goal-card ${goalStatus === 'active' ? 'active' : ''}`}>
      <div className="goal-card-header">
        <h5>{goalTitle}</h5>
      </div>
      
      <div className="goal-card-content">
        <div className="priority-container">
          <Chip
            size="small"
            label={`優先級: ${priorityNumber} (${priority})`}
            className={`priority-chip priority-${priorityClass}`}
          />
          
          <Tooltip title="編輯優先級" arrow>
            <IconButton 
              size="small" 
              className="edit-priority-btn"
              onClick={handleOpenMenu}
              aria-label="編輯優先級"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={() => handlePriorityChange("High")}>
              優先級: 1 (High 高)
            </MenuItem>
            <MenuItem onClick={() => handlePriorityChange("Medium")}>
              優先級: 2 (Medium 中)
            </MenuItem>
            <MenuItem onClick={() => handlePriorityChange("Low")}>
              優先級: 3 (Low 低)
            </MenuItem>
          </Menu>
        </div>
        
        <div className="due-date-container">
          <Box 
            className="date-display"
            onClick={handleDateClick}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <CalendarTodayIcon fontSize="small" className="date-icon" />
            <Typography variant="body2">
              {formatDate(targetDate)}
            </Typography>
          </Box>
        </div>
      </div>
    </div>
  );
}
