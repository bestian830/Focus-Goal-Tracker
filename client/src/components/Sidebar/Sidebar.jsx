import { useState, useEffect } from "react";
import { Tooltip } from "@mui/material";
import GoalCard from "./GoalCard";
import AddGoalButton from "./AddGoalButton";
import OnboardingModal from "../OnboardingModal";

export default function Sidebar({ onGoalSelect, goals = [] }) {
  const [sortedGoals, setSortedGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  // Check if user is a temporary user
  const isGuest = checkIsGuest();
  // Count active goals (for registered users)
  const activeGoalsCount = isGuest ? 0 : sortedGoals.filter(g => g.status === 'active').length;
  // Check limitations based on user type
  const hasTempUserGoal = isGuest && sortedGoals.length > 0;
  const hasMaxRegularUserGoals = !isGuest && activeGoalsCount >= 4;
  const isAddGoalDisabled = hasTempUserGoal || hasMaxRegularUserGoals;

  useEffect(() => {
    // Use the passed goals data
    if (goals && goals.length > 0) {
      const sorted = sortGoals(goals);
      setSortedGoals(sorted);
      
      // If there are goals, select the first one by default
      if (sorted.length > 0 && onGoalSelect) {
        onGoalSelect(sorted[0]._id || sorted[0].id);
      }
    } else {
      // Clear goals list
      setSortedGoals([]);
      console.log("No goals available to display");
    }
  }, [goals, onGoalSelect]);

  const sortGoals = (goalList) => {
    if (!goalList || goalList.length === 0) return [];
    
    const priorityMap = { "High": 1, "Medium": 2, "Low": 3 };
    return [...goalList].sort((a, b) => {
      // First sort by priority
      const aPriority = a.priority || "Medium";
      const bPriority = b.priority || "Medium";
      
      // Sort priority by numeral value (1, 2, 3 from top to bottom)
      if (priorityMap[aPriority] !== priorityMap[bPriority]) {
        return priorityMap[aPriority] - priorityMap[bPriority];
      }
      
      // Then sort by target date
      const aDate = a.targetDate || a.dueDate || new Date();
      const bDate = b.targetDate || b.dueDate || new Date();
      
      return new Date(aDate) - new Date(bDate);
    });
  };

  // Open goal setting modal
  const handleAddGoalClick = () => {
    // If user has reached goal limit, don't proceed
    if (isAddGoalDisabled) {
      console.log(`User has reached goal limit: ${isGuest ? "Temporary user (1 goal)" : "Regular user (4 active goals)"}`);
      return;
    }
    
    setShowGoalModal(true);
  };

  // Close goal setting modal
  const handleCloseGoalModal = () => {
    setShowGoalModal(false);
  };

  // Handle goal creation completion
  const handleGoalComplete = (newGoal) => {
    console.log("New goal created:", newGoal);
    // Close modal
    setShowGoalModal(false);
    // If parent component provides a goal selection function, select the newly created goal
    if (onGoalSelect && newGoal && (newGoal._id || newGoal.id)) {
      onGoalSelect(newGoal._id || newGoal.id);
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
  const handlePriorityChange = (goalId, newPriority) => {
    console.log(`Goal ${goalId} priority changed to ${newPriority}, resorting...`);
    
    // Find the goal and update its priority
    const updatedGoals = sortedGoals.map(goal => {
      if ((goal._id || goal.id) === goalId) {
        return { ...goal, priority: newPriority };
      }
      return goal;
    });
    
    // Re-sort the goals with the updated priority
    const newSorted = sortGoals(updatedGoals);
    setSortedGoals(newSorted);
  };

  return (
    <div className="sidebar">
      {renderAddGoalButton()}
      {sortedGoals.map((goal) => (
        <div 
          key={goal._id || goal.id} 
          onClick={() => onGoalSelect && onGoalSelect(goal._id || goal.id)}
          className="goal-item"
        >
          <GoalCard 
            goal={goal} 
            onPriorityChange={handlePriorityChange}
          />
        </div>
      ))}
      {sortedGoals.length === 0 && (
        <div className="no-goals">
          <p>No goals yet</p>
          <p>Click the "Add Goal" button above to create your first goal!</p>
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
