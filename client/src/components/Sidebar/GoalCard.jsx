import React, { useState, useEffect } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { zhCN } from "date-fns/locale";
import apiService from "../../services/api";

export default function GoalCard({ goal, onPriorityChange, onDateChange }) {
  // 增強的安全檢查，確保 goal 是有效對象
  if (!goal || typeof goal !== "object") {
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
    targetDate: goal.targetDate || goal.dueDate,
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [priority, setPriority] = useState(goal.priority || "Medium");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [targetDate, setTargetDate] = useState(
    goal.targetDate
      ? new Date(goal.targetDate)
      : goal.dueDate
      ? new Date(goal.dueDate)
      : null
  );

  // 當目標屬性變化時更新本地狀態
  useEffect(() => {
    if (goal.priority && goal.priority !== priority && hasLoaded) {
      console.log(
        `Updating priority state from ${priority} to ${goal.priority}`
      );
      setPriority(goal.priority);
    } else {
      setHasLoaded(true);
    }

    // 更新目標日期 - 增強日誌記錄以幫助調試
    const newDate = goal.targetDate || goal.dueDate;
    if (newDate) {
      const newDateObj = new Date(newDate);

      // 檢查當前日期是否與新日期不同
      const needsUpdate =
        !targetDate || targetDate.getTime() !== newDateObj.getTime();

      if (needsUpdate) {
        console.log(`[日期] 目標屬性變化，更新日期狀態`, {
          目標ID: goal._id || goal.id,
          新日期: newDateObj.toISOString(),
          舊日期: targetDate ? targetDate.toISOString() : "無",
        });
        setTargetDate(newDateObj);
      }
    }
  }, [
    goal.priority,
    priority,
    hasLoaded,
    goal.targetDate,
    goal.dueDate,
    targetDate,
  ]);

  // 優先級映射 - 文字到顯示數字
  const priorityMap = {
    High: 1,
    Medium: 2,
    Low: 3,
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
          priority: newPriority,
        });
        console.log(
          `Priority updated successfully to ${newPriority}`,
          response
        );

        // 如果 API 返回更新後的數據，再次通知父組件
        if (
          response &&
          response.data &&
          response.data.success &&
          response.data.data
        ) {
          // 通知父組件更新後的目標數據，觸發重新渲染
          if (onPriorityChange) {
            onPriorityChange(goalId, newPriority, response.data.data);
          }
        }
      } catch (apiError) {
        console.error("API failed to update goal priority:", apiError);
        // 回滾本地狀態
        setPriority(priority);
        // 通知父組件優先級更新失敗
        if (onPriorityChange) {
          onPriorityChange(goalId, priority);
        }
      }
    } catch (error) {
      console.error("Failed to update goal priority:", error);
    }
  };

  // 處理日期變更 - 完全像 RewardsStep 那樣實現
  const handleDateChange = async (newDate) => {
    if (!newDate) return;

    const goalId = goal._id || goal.id;
    if (!goalId) {
      console.error("Missing goal ID for date change");
      return;
    }

    console.log(`日期變更: ${goalId}, 從 ${targetDate} 到 ${newDate}`);

    // 更新本地狀態
    setTargetDate(newDate);

    // 通知父組件（可選）
    if (onDateChange) {
      onDateChange(goalId, newDate);
    }

    // 直接通過 API 更新
    try {
      const response = await apiService.goals.update(goalId, {
        targetDate: newDate, // 直接傳遞 Date 對象
      });

      console.log("日期更新成功:", response.data);

      // 可選：如果 API 返回更新後的數據，通知父組件
      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        onDateChange
      ) {
        onDateChange(goalId, newDate, response.data.data);
      }
    } catch (error) {
      console.error("日期更新失敗:", error);
      // 回滾本地狀態（可選）
      const originalDate = goal.targetDate
        ? new Date(goal.targetDate)
        : goal.dueDate
        ? new Date(goal.dueDate)
        : null;
      setTargetDate(originalDate);
    }
  };

  // 安全獲取標題和狀態
  const goalTitle = goal.title || "Unnamed Goal";
  const goalStatus = goal.status || "active";

  return (
    <div className={`goal-card ${goalStatus === "active" ? "active" : ""}`}>
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="目標日期"
              value={targetDate}
              onChange={handleDateChange}
              disablePast
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  size: "small",
                  helperText: "選擇目標完成日期",
                },
              }}
            />
          </LocalizationProvider>
        </div>
      </div>
    </div>
  );
}
