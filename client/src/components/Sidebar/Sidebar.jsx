import { useState, useEffect } from "react";
import GoalCard from "./GoalCard";
import AddGoalButton from "./AddGoalButton";
import OnboardingModal from "../OnboardingModal";

export default function Sidebar({ onGoalSelect, goals = [] }) {
  const [sortedGoals, setSortedGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    // 使用传入的真实目标数据
    if (goals && goals.length > 0) {
      const sorted = sortGoals(goals);
      setSortedGoals(sorted);
      
      // 如果有目标，默认选择第一个
      if (sorted.length > 0 && onGoalSelect) {
        onGoalSelect(sorted[0]._id || sorted[0].id);
      }
    } else {
      // 清空目标列表
      setSortedGoals([]);
      console.log("No goals available to display");
    }
  }, [goals, onGoalSelect]);

  const sortGoals = (goalList) => {
    if (!goalList || goalList.length === 0) return [];
    
    const priorityMap = { "High": 1, "Medium": 2, "Low": 3 };
    return [...goalList].sort((a, b) => {
      // 首先按优先级排序
      const aPriority = a.priority || "Medium";
      const bPriority = b.priority || "Medium";
      
      if (priorityMap[aPriority] !== priorityMap[bPriority]) {
        return priorityMap[aPriority] - priorityMap[bPriority];
      }
      
      // 然后按截止日期排序
      const aDate = a.targetDate || a.dueDate || new Date();
      const bDate = b.targetDate || b.dueDate || new Date();
      
      return new Date(aDate) - new Date(bDate);
    });
  };

  // 打开目标设置模态框
  const handleAddGoalClick = () => {
    setShowGoalModal(true);
  };

  // 关闭目标设置模态框
  const handleCloseGoalModal = () => {
    setShowGoalModal(false);
  };

  // 处理目标创建完成
  const handleGoalComplete = (newGoal) => {
    console.log("New goal created:", newGoal);
    // 关闭模态框
    setShowGoalModal(false);
    // 如果父组件提供了目标选择函数，选择新创建的目标
    if (onGoalSelect && newGoal && (newGoal._id || newGoal.id)) {
      onGoalSelect(newGoal._id || newGoal.id);
    }
  };

  // 获取用户ID
  const getUserId = () => {
    const userId = localStorage.getItem("userId");
    const tempId = localStorage.getItem("tempId");
    return userId || tempId;
  };

  // 检查是否是临时用户
  const checkIsGuest = () => {
    return !localStorage.getItem("userId") && !!localStorage.getItem("tempId");
  };

  return (
    <div className="sidebar">
      <AddGoalButton onAddGoalClick={handleAddGoalClick} />
      {sortedGoals.map((goal) => (
        <div 
          key={goal._id || goal.id} 
          onClick={() => onGoalSelect && onGoalSelect(goal._id || goal.id)}
          className="goal-item"
        >
          <GoalCard goal={goal} />
        </div>
      ))}
      {sortedGoals.length === 0 && (
        <div className="no-goals">
          <p>目前没有目标</p>
          <p>点击上方的"添加目标"按钮创建你的第一个目标！</p>
        </div>
      )}

      {/* 目标设置引导模态框 */}
      <OnboardingModal
        open={showGoalModal}
        onClose={handleCloseGoalModal}
        userId={getUserId()}
        isGuest={checkIsGuest()}
        onComplete={handleGoalComplete}
      />
    </div>
  );
}
