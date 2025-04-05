import { useState, useEffect, useRef } from "react";
import { Tooltip } from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { zhCN } from 'date-fns/locale';
import GoalCard from "./GoalCard";
import AddGoalButton from "./AddGoalButton";
import OnboardingModal from "../OnboardingModal";
import apiService from "../../services/api";

export default function Sidebar({ 
  onGoalSelect, 
  goals = [], 
  onAddGoalClick, 
  onPriorityChange, 
  onDateChange,
  activeGoalId 
}) {
  const [sortedGoals, setSortedGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  // 日期選擇器狀態
  const [datePickerState, setDatePickerState] = useState({
    isOpen: false,
    goalId: null,
    currentDate: null,
    position: { top: 0, left: 0 }
  });
  const dateDisplayRef = useRef(null);
  
  // Check if user is a temporary user
  const isGuest = checkIsGuest();
  // Count active goals (for registered users)
  const activeGoalsCount = isGuest ? 0 : sortedGoals.filter(g => g.status === 'active').length;
  // Check limitations based on user type
  const hasTempUserGoal = isGuest && sortedGoals.length > 0;
  const hasMaxRegularUserGoals = !isGuest && activeGoalsCount >= 4;
  const isAddGoalDisabled = hasTempUserGoal || hasMaxRegularUserGoals;

  useEffect(() => {
    // 每次 goals 變化時都輸出詳細日誌
    console.log("Goals prop changed in Sidebar:", goals);
    console.log("Current goals count:", goals?.length || 0);
    console.log("Active goal ID:", activeGoalId);
    
    // 通過深度比較檢查 goals 是否真的變化了
    const goalsString = JSON.stringify(goals);
    console.log("Goals data hash:", goalsString.length);
    
    if (goals && Array.isArray(goals)) {
      if (goals.length > 0) {
        console.log("Goals received in Sidebar:", 
          goals.map(g => ({ 
            id: g._id || g.id, 
            title: g.title,
            priority: g.priority,
            userId: g.userId
          }))
        );
        
        try {
          // 確保深度拷貝，防止意外修改原始數據
          const goalsCopy = JSON.parse(JSON.stringify(goals));
          const sorted = sortGoals(goalsCopy);
          console.log("Sorted goals:", sorted.map(g => g.title));
          setSortedGoals(sorted);
          
          // 如果有目標且未選擇目標，則自動選擇第一個
          if (sorted.length > 0 && onGoalSelect && !activeGoalId) {
            const firstGoalId = sorted[0]._id || sorted[0].id;
            console.log("Auto-selecting first goal:", firstGoalId);
            onGoalSelect(firstGoalId);
          }
        } catch (error) {
          console.error("Error processing goals:", error);
          // 嘗試以更簡單的方式處理
          setSortedGoals([...goals]);
          console.log("Falling back to unprocessed goals");
        }
      } else {
        // 清空目標列表
        console.log("No goals available to display, clearing sorted goals list");
        setSortedGoals([]);
      }
    } else {
      console.error("Invalid goals data received:", goals);
      setSortedGoals([]);
    }
  }, [goals, onGoalSelect, activeGoalId]);

  const sortGoals = (goalList) => {
    if (!goalList || goalList.length === 0) {
      console.log("No goals to sort");
      return [];
    }
    
    console.log("Sorting goals, count:", goalList.length);
    
    try {
      const priorityMap = { "High": 1, "Medium": 2, "Low": 3 };
      return [...goalList].sort((a, b) => {
        // 確保目標對象有效
        if (!a || !b) {
          console.error("Invalid goal objects in sort function:", { a, b });
          return 0;
        }
        
        // 先按優先級排序
        const aPriority = a.priority || "Medium";
        const bPriority = b.priority || "Medium";
        
        // 按數值排序
        if (priorityMap[aPriority] !== priorityMap[bPriority]) {
          return priorityMap[aPriority] - priorityMap[bPriority];
        }
        
        // 再按目標日期排序
        const aDate = a.targetDate || a.dueDate || new Date();
        const bDate = b.targetDate || b.dueDate || new Date();
        
        return new Date(aDate) - new Date(bDate);
      });
    } catch (error) {
      console.error("Error sorting goals:", error);
      return goalList; // 出錯時返回原始列表
    }
  };

  // Open goal setting modal
  const handleAddGoalClick = () => {
    // If user has reached goal limit, don't proceed
    if (isAddGoalDisabled) {
      console.log(`User has reached goal limit: ${isGuest ? "Temporary user (1 goal)" : "Regular user (4 active goals)"}`);
      return;
    }
    
    if (onAddGoalClick) {
      onAddGoalClick();
    } else {
      setShowGoalModal(true);
    }
  };

  // Close goal setting modal
  const handleCloseGoalModal = () => {
    setShowGoalModal(false);
  };

  // Handle goal creation completion
  const handleGoalComplete = (newGoal) => {
    console.log("New goal created in Sidebar:", newGoal);
    
    // 關閉模態框
    setShowGoalModal(false);
    
    // 添加新目標到本地列表並重新排序
    // 注意: Home 組件也會刷新目標列表，這只是一個快速更新
    if (newGoal && (newGoal._id || newGoal.id)) {
      const updatedGoals = [...sortedGoals, newGoal];
      const newSorted = sortGoals(updatedGoals);
      console.log("Updated goal list with new goal:", newGoal.title);
      setSortedGoals(newSorted);
      
      // 選擇新創建的目標
      if (onGoalSelect) {
        console.log("Selecting newly created goal:", newGoal._id || newGoal.id);
        onGoalSelect(newGoal._id || newGoal.id);
      }
    }
  };

  // Get user ID
  const getUserId = () => {
    const userId = localStorage.getItem("userId");
    const tempId = localStorage.getItem("tempId");
    return userId || tempId;
  };

  // Check if user is a temporary user
  function checkIsGuest() {
    return !localStorage.getItem("userId") && !!localStorage.getItem("tempId");
  }

  // Render add goal button with appropriate tooltip
  const renderAddGoalButton = () => {
    // If user has reached goal limit, show appropriate tooltip
    if (isAddGoalDisabled) {
      let tooltipMessage = "";
      
      if (hasTempUserGoal) {
        tooltipMessage = "Temporary users are limited to one goal. Register for an account to create more!";
      } else if (hasMaxRegularUserGoals) {
        tooltipMessage = "You have reached the maximum of 4 active goals. Complete or archive existing goals to create new ones.";
      }
      
      return (
        <Tooltip title={tooltipMessage} arrow>
          <span>
            <AddGoalButton onAddGoalClick={handleAddGoalClick} disabled={true} />
          </span>
        </Tooltip>
      );
    }
    
    // Otherwise show normal add button
    return <AddGoalButton onAddGoalClick={handleAddGoalClick} disabled={false} />;
  }

  // Handle priority change
  const handlePriorityChange = (goalId, newPriority, updatedGoal) => {
    console.log(`Sidebar handling priority change for goal ${goalId} to ${newPriority}`);
    
    // 優先使用父組件提供的 onPriorityChange 函數
    if (onPriorityChange) {
      onPriorityChange(goalId, newPriority, updatedGoal);
    }
    
    // 僅在沒有獲得更新的目標數據時進行本地排序
    if (!updatedGoal) {
      // 本地優先級更新，保持排序一致性
      const updatedGoals = sortedGoals.map(goal => {
        if ((goal._id && goal._id === goalId) || (goal.id && goal.id === goalId)) {
          return { ...goal, priority: newPriority };
        }
        return goal;
      });
      
      // 重新排序目標
      const newSorted = sortGoals(updatedGoals);
      setSortedGoals(newSorted);
    }
  };

  // 處理日期選擇器開關
  const handleDatePickerToggle = (event, goalId, currentDate, isOpen) => {
    event.stopPropagation();
    
    if (isOpen) {
      // 獲取觸發元素的位置
      const rect = event.currentTarget.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // 計算日期選擇器的位置
      setDatePickerState({
        isOpen: true,
        goalId,
        currentDate,
        position: {
          top: rect.bottom + scrollTop,
          left: rect.left
        }
      });
      
      // 保存引用，用於點擊外部關閉
      dateDisplayRef.current = event.currentTarget;
    } else {
      // 關閉選擇器
      setDatePickerState(prev => ({
        ...prev,
        isOpen: false
      }));
    }
  };
  
  // 處理日期變更
  const handleDateChange = async (newDate) => {
    if (!newDate) {
      // 關閉日期選擇器
      setDatePickerState(prev => ({
        ...prev,
        isOpen: false
      }));
      return;
    }
    
    const goalId = datePickerState.goalId;
    if (!goalId) {
      console.error("Missing goal ID for date change");
      return;
    }
    
    console.log(`Sidebar handling date change for goal ${goalId} to ${newDate}`);
    
    // 關閉日期選擇器
    setDatePickerState(prev => ({
      ...prev,
      isOpen: false
    }));
    
    // 優先使用父組件提供的 onDateChange 函數
    if (onDateChange) {
      onDateChange(goalId, newDate);
    }
    
    // 通過 API 更新目標日期
    try {
      const response = await apiService.goals.update(goalId, {
        targetDate: newDate.toISOString()
      });
      console.log(`Target date updated successfully to ${newDate}`, response);
      
      // 如果 API 返回更新後的數據
      if (response && response.data && response.data.success && response.data.data) {
        if (onDateChange) {
          onDateChange(goalId, newDate, response.data.data);
        }
      }
    } catch (apiError) {
      console.error('API failed to update target date:', apiError);
      // 通知父組件日期更新失敗
      if (onDateChange) {
        const goal = sortedGoals.find(g => (g._id || g.id) === goalId);
        if (goal) {
          const oldDate = goal.targetDate || goal.dueDate;
          if (oldDate) {
            onDateChange(goalId, new Date(oldDate));
          }
        }
      }
    }
  };
  
  // 處理點擊外部關閉日期選擇器
  useEffect(() => {
    if (datePickerState.isOpen) {
      const handleClickOutside = (event) => {
        const pickerElement = document.querySelector('.date-picker-popup');
        
        // 檢查點擊是否在日期選擇器外部且不是觸發元素
        if (
          pickerElement && 
          !pickerElement.contains(event.target) && 
          dateDisplayRef.current && 
          !dateDisplayRef.current.contains(event.target)
        ) {
          setDatePickerState(prev => ({
            ...prev,
            isOpen: false
          }));
        }
      };
      
      // 添加全局點擊事件監聽器
      document.addEventListener('mousedown', handleClickOutside);
      
      // 清理函數
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [datePickerState.isOpen]);

  return (
    <div className="sidebar">
      {renderAddGoalButton()}
      
      <div className="goal-list">
        {sortedGoals.length > 0 ? (
          sortedGoals.map((goal) => {
            // 獲取目標 ID
            const goalId = goal._id || goal.id;
            if (!goalId) {
              console.error("Goal is missing ID:", goal);
              return null;
            }
            
            return (
              <div 
                key={goalId} 
                onClick={() => {
                  console.log("Goal selected:", goal.title);
                  onGoalSelect && onGoalSelect(goalId);
                }}
                className={`goal-item ${goalId === activeGoalId ? 'active' : ''}`}
              >
                <GoalCard 
                  goal={goal} 
                  onPriorityChange={handlePriorityChange}
                  onDateClick={(event, date) => handleDatePickerToggle(event, goalId, date, true)}
                />
              </div>
            );
          })
        ) : (
          <div className="no-goals">
            <p>No goals yet</p>
            <p>Click the "Add Goal" button above to create your first goal!</p>
          </div>
        )}
      </div>
      
      {/* 全局日期選擇器 - 在 DOM 結構中獨立於 goal-item */}
      {datePickerState.isOpen && (
        <div 
          className="date-picker-popup"
          style={{
            position: 'absolute',
            top: `${datePickerState.position.top}px`,
            left: `${datePickerState.position.left}px`,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
            <DatePicker
              label="預期完成日期"
              value={datePickerState.currentDate}
              onChange={(newDate) => handleDateChange(newDate)}
              disablePast
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  variant: "outlined",
                  size: "small",
                  helperText: "選擇目標完成日期"
                } 
              }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </div>
      )}

      {/* Goal setting guide modal */}
      <OnboardingModal
        open={showGoalModal}
        onClose={handleCloseGoalModal}
        userId={getUserId()}
        isGuest={isGuest}
        onComplete={handleGoalComplete}
      />
    </div>
  );
}
