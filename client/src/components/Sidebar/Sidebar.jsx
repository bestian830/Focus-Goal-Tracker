import { useState, useEffect } from "react";
import GoalCard from "./GoalCard";
import AddGoalButton from "./AddGoalButton";

export default function Sidebar({ onGoalSelect, goals = [] }) {
  const [sortedGoals, setSortedGoals] = useState([]);

  useEffect(() => {
    // 如果传入了真实目标数据，则使用它们
    if (goals && goals.length > 0) {
      const sorted = sortGoals(goals);
      setSortedGoals(sorted);
      
      // 如果有目标，默认选择第一个
      if (sorted.length > 0 && onGoalSelect) {
        onGoalSelect(sorted[0]._id || sorted[0].id);
      }
    } else {
      // 如果没有真实数据，使用 mock 数据（仅用于开发）
      console.log("No real goals provided, using mock data");
      const mockGoals = [
        { id: 1, title: "Learn Advanced JavaScript", priority: "High", dueDate: "2024-04-01" },
        { id: 2, title: "Complete UI/UX Course", priority: "Medium", dueDate: "2024-03-15" },
        { id: 3, title: "Learn React", priority: "High", dueDate: "2024-03-10" },
      ];
      const sorted = sortGoals(mockGoals);
      setSortedGoals(sorted);
      
      // 默认选择第一个 mock 目标
      if (sorted.length > 0 && onGoalSelect) {
        onGoalSelect(sorted[0].id);
      }
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

  return (
    <div className="sidebar">
      <AddGoalButton />
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
    </div>
  );
}
