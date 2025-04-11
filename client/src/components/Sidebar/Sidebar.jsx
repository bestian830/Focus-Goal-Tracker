import { useState, useEffect } from "react";
import { Tooltip } from "@mui/material";
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
  activeGoalId,
}) {
  const [sortedGoals, setSortedGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Check if user is a temporary user
  const isGuest = checkIsGuest();
  // Count active goals (for registered users)
  const activeGoalsCount = isGuest
    ? 0
    : sortedGoals.filter((g) => g.status === "active").length;
  // Check limitations based on user type
  const hasTempUserGoal = isGuest && sortedGoals.length > 0;
  const hasMaxRegularUserGoals = !isGuest && activeGoalsCount >= 4;
  const isAddGoalDisabled = hasTempUserGoal || hasMaxRegularUserGoals;

  useEffect(() => {
    // every time goals change, output detailed logs
    console.log("Goals prop changed in Sidebar:", goals);
    console.log("Current goals count:", goals?.length || 0);
    console.log("Active goal ID:", activeGoalId);

    // check if goals really changed by deep comparison
    const goalsString = JSON.stringify(goals);
    console.log("Goals data hash:", goalsString.length);

    if (goals && Array.isArray(goals)) {
      if (goals.length > 0) {
        console.log(
          "Goals received in Sidebar:",
          goals.map((g) => ({
            id: g._id || g.id,
            title: g.title,
            priority: g.priority,
            userId: g.userId,
          }))
        );

        try {
          // ensure deep copy, prevent accidental modification of original data
          const goalsCopy = JSON.parse(JSON.stringify(goals));
          const sorted = sortGoals(goalsCopy);
          console.log(
            "Sorted goals:",
            sorted.map((g) => g.title)
          );
          setSortedGoals(sorted);

          // if there are goals and no active goal, automatically select the first one
          if (sorted.length > 0 && onGoalSelect && !activeGoalId) {
            const firstGoalId = sorted[0]._id || sorted[0].id;
            console.log("Auto-selecting first goal:", firstGoalId);
            onGoalSelect(firstGoalId);
          }
        } catch (error) {
          console.error("Error processing goals:", error);
          // try to handle simpler
          setSortedGoals([...goals]);
          console.log("Falling back to unprocessed goals");
        }
      } else {
        // clear goal list
        console.log(
          "No goals available to display, clearing sorted goals list"
        );
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
      const priorityMap = { High: 1, Medium: 2, Low: 3 };
      return [...goalList].sort((a, b) => {
        // ensure goal objects are valid
        if (!a || !b) {
          console.error("Invalid goal objects in sort function:", { a, b });
          return 0;
        }

        // sort by priority first
        const aPriority = a.priority || "Medium";
        const bPriority = b.priority || "Medium";

        // sort by priority
        if (priorityMap[aPriority] !== priorityMap[bPriority]) {
          return priorityMap[aPriority] - priorityMap[bPriority];
        }

        // sort by target date
        const aDate = a.targetDate || a.dueDate || new Date();
        const bDate = b.targetDate || b.dueDate || new Date();

        return new Date(aDate) - new Date(bDate);
      });
    } catch (error) {
      console.error("Error sorting goals:", error);
      return goalList; // return original list if error
    }
  };

  // Open goal setting modal
  const handleAddGoalClick = () => {
    // If user has reached goal limit, don't proceed
    if (isAddGoalDisabled) {
      console.log(
        `User has reached goal limit: ${
          isGuest ? "Temporary user (1 goal)" : "Regular user (4 active goals)"
        }`
      );
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

    // close modal
    setShowGoalModal(false);

    // add new goal to local list and re-sort
    // note: Home component will also refresh goal list, this is a quick update
    if (newGoal && (newGoal._id || newGoal.id)) {
      const updatedGoals = [...sortedGoals, newGoal];
      const newSorted = sortGoals(updatedGoals);
      console.log("Updated goal list with new goal:", newGoal.title);
      setSortedGoals(newSorted);

      // select newly created goal
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
        tooltipMessage =
          "Temporary users are limited to one goal. Register for an account to create more!";
      } else if (hasMaxRegularUserGoals) {
        tooltipMessage =
          "You have reached the maximum of 4 active goals. Complete or archive existing goals to create new ones.";
      }

      return (
        <Tooltip title={tooltipMessage} arrow>
          <span>
            <AddGoalButton
              onAddGoalClick={handleAddGoalClick}
              disabled={true}
            />
          </span>
        </Tooltip>
      );
    }

    // Otherwise show normal add button
    return (
      <AddGoalButton onAddGoalClick={handleAddGoalClick} disabled={false} />
    );
  };

  // Handle priority change
  const handlePriorityChange = (goalId, newPriority, updatedGoal) => {
    console.log(
      `Sidebar handling priority change for goal ${goalId} to ${newPriority}`
    );

    // use parent component's onPriorityChange function first
    if (onPriorityChange) {
      onPriorityChange(goalId, newPriority, updatedGoal);
    }

    // only sort locally if no updated goal data is received
    if (!updatedGoal) {
      // local priority update, maintain consistency
      const updatedGoals = sortedGoals.map((goal) => {
        if (
          (goal._id && goal._id === goalId) ||
          (goal.id && goal.id === goalId)
        ) {
          return { ...goal, priority: newPriority };
        }
        return goal;
      });

      // re-sort goals
      const newSorted = sortGoals(updatedGoals);
      setSortedGoals(newSorted);
    }
  };

  return (
    <div className="sidebar">
      {renderAddGoalButton()}

      <div className="goal-list">
        {sortedGoals.length > 0 ? (
          sortedGoals.map((goal) => {
            // get goal ID
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
                className={`goal-item ${
                  goalId === activeGoalId ? "active" : ""
                }`}
              >
                <GoalCard
                  goal={goal}
                  onPriorityChange={handlePriorityChange}
                  onDateChange={(goalId, newDate, updatedGoal) => {
                    console.log(
                      `[important] GoalCard date changed: ${goalId} -> ${newDate}`
                    );

                    // if updated goal object is received, update the whole goal
                    if (updatedGoal) {
                      console.log(`using full data to update goal`);

                      // notify parent component
                      if (onDateChange) {
                        onDateChange(goalId, newDate, updatedGoal);
                      }

                      // local update
                      const updatedGoals = sortedGoals.map((g) => {
                        if (g._id === goalId || g.id === goalId) {
                          return { ...g, ...updatedGoal };
                        }
                        return g;
                      });
                      const newSorted = sortGoals(updatedGoals);
                      setSortedGoals(newSorted);
                    } else {
                      // only update date
                      console.log(`only update goal date`);

                      // notify parent component
                      if (onDateChange) {
                        onDateChange(goalId, newDate);
                      }

                      // local update
                      const updatedGoals = sortedGoals.map((g) => {
                        if (g._id === goalId || g.id === goalId) {
                          return { ...g, targetDate: newDate };
                        }
                        return g;
                      });
                      const newSorted = sortGoals(updatedGoals);
                      setSortedGoals(newSorted);
                    }
                  }}
                />
              </div>
            );
          })
        ) : (
          <div className="no-goals">
            <p>No goals yet</p>
            <p>Click the "Add Goal" button above to create your goal!</p>
          </div>
        )}
      </div>

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
