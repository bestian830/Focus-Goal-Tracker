import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Collapse,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FolderIcon from "@mui/icons-material/Folder";
import GoalCard from "./GoalCard";
import OnboardingModal from "../OnboardingModal";
import Search from "./Search";
import PropTypes from 'prop-types';

export default function Sidebar({
  onGoalSelect,
  goals: initialGoals = [],
  onAddGoalClick,
  onPriorityChange,
  onDateChange,
  activeGoalId,
  onGoalUpdate,
}) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allGoals, setAllGoals] = useState(initialGoals);
  const [showArchived, setShowArchived] = useState(false);
  
  const isLoading = false;
  const error = null;

  const checkIsGuest = () => {
    return !localStorage.getItem("userId") && !!localStorage.getItem("tempId");
  };
  
  const isGuest = checkIsGuest();

  useEffect(() => {
    setAllGoals(initialGoals);
  }, [initialGoals]);

  const sortGoals = (goalList) => {
    if (!goalList || goalList.length === 0) {
      return [];
    }

    const priorityMap = { High: 1, Medium: 2, Low: 3 };
    
    return [...goalList].sort((a, b) => {
      if (!a || !b) {
        console.error("Invalid goal objects in sort function:", { a, b });
        return 0;
      }

      const aPriority = a.priority || "Medium";
      const bPriority = b.priority || "Medium";

      if (priorityMap[aPriority] !== priorityMap[bPriority]) {
        return priorityMap[aPriority] - priorityMap[bPriority];
      }

      const aDate = a.targetDate || a.dueDate || new Date();
      const bDate = b.targetDate || b.dueDate || new Date();

      return new Date(aDate) - new Date(bDate);
    });
  };

  const filteredAndSortedGoals = useMemo(() => {
    let goalsToDisplay = allGoals;

    if (searchQuery) {
      goalsToDisplay = allGoals.filter(goal =>
        goal.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return sortGoals(goalsToDisplay);
    } else {
      goalsToDisplay = allGoals.filter(goal => goal.status !== 'archived');
      
      return sortGoals(goalsToDisplay);
    }
  }, [allGoals, searchQuery]);

  const archivedGoals = useMemo(() => {
    return sortGoals(allGoals.filter(goal => goal.status === 'archived'));
  }, [allGoals]);

  const activeGoalsCount = useMemo(() => {
    return allGoals.filter(goal => goal.status === "active").length;
  }, [allGoals]);

  const archivedGoalsCount = useMemo(() => {
    return archivedGoals.length;
  }, [archivedGoals]);

  const isAddGoalDisabled = useMemo(() => {
    const hasTempUserGoal = isGuest && allGoals.length > 0;
    const hasMaxRegularUserGoals = !isGuest && activeGoalsCount >= 4;
    return hasTempUserGoal || hasMaxRegularUserGoals;
  }, [isGuest, allGoals.length, activeGoalsCount]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleGoalArchived = (archivedGoalId) => {
     console.log(`Sidebar received archive event for goal: ${archivedGoalId}`);
     setAllGoals(currentGoals =>
        currentGoals.map(goal =>
          goal._id === archivedGoalId ? { ...goal, status: 'archived' } : goal
        )
     );
     if (onGoalUpdate) {
         const updatedGoal = allGoals.find(g => g._id === archivedGoalId);
         if(updatedGoal) {
             onGoalUpdate({ ...updatedGoal, status: 'archived' });
         }
     }
  };

  const toggleShowArchived = () => {
    setShowArchived(prev => !prev);
  };

  const handleOpenAddGoalModal = () => {
    if (isAddGoalDisabled) {
      return;
    }
    
    if (onAddGoalClick) {
      onAddGoalClick();
    } else {
      setShowGoalModal(true);
    }
  };

  const handleCloseGoalModal = (goalAdded) => {
    setShowGoalModal(false);
    if (goalAdded && onGoalUpdate) {
      onGoalUpdate(goalAdded);
    }
  };

  const getUserId = () => {
    const userId = localStorage.getItem("userId");
    const tempId = localStorage.getItem("tempId");
    return userId || tempId;
  };

  const getAddGoalTooltip = () => {
    if (isGuest) {
      return "Guests can only create one goal. Please sign up or log in to add more goals.";
    }
    if (activeGoalsCount >= 4) {
      return "You have reached the maximum of 4 active goals. Complete or archive existing goals to create new ones.";
    }
    return "";
  };

  return (
    <Box
      sx={{
        width: "300px",
        height: "100vh",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Goals
      </Typography>

      <Search onSearchChange={handleSearchChange} />

      <Tooltip title={getAddGoalTooltip()}>
        <span>
           <Button
             variant="contained"
             startIcon={<AddCircleOutlineIcon />}
             onClick={handleOpenAddGoalModal}
             fullWidth
             sx={{ mb: 2 }}
             disabled={isAddGoalDisabled}
           >
             Add New Goal
           </Button>
        </span>
      </Tooltip>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {isLoading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {!isLoading && !error && (
          <>
            {/* Active Goals */}
            {filteredAndSortedGoals.length === 0 ? (
              <Typography color="text.secondary" align="center">
                {searchQuery ? "No goals match your search." : "No active goals yet."}
              </Typography>
            ) : (
              filteredAndSortedGoals.map((goal) => (
                <Box
                  key={goal._id || goal.id}
                  onClick={() => onGoalSelect(goal)}
                  sx={{
                    cursor: "pointer",
                    mb: 1.5,
                    p: 1,
                    borderRadius: 1,
                    border: activeGoalId === (goal._id || goal.id) ? '2px solid' : '1px solid',
                    borderColor: activeGoalId === (goal._id || goal.id) ? 'primary.main' : 'divider',
                    backgroundColor: 'inherit',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <GoalCard
                    goal={goal}
                    onPriorityChange={onPriorityChange}
                    onDateChange={onDateChange}
                    onGoalArchived={handleGoalArchived}
                  />
                </Box>
              ))
            )}
            
            {/* Archived Goals Section */}
            {archivedGoalsCount > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    borderRadius: 1,
                    p: 1.5,
                    backgroundColor: 'rgba(0,0,0,0.02)'
                  }}
                  onClick={toggleShowArchived}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FolderIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Archived Goals ({archivedGoalsCount})
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: 'text.secondary', p: 0.5 }}>
                    {showArchived ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
                
                <Collapse in={showArchived}>
                  <Box sx={{ pl: 0.5, pr: 0.5, mt: 1 }}>
                    {archivedGoals.map((goal) => (
                      <Box
                        key={goal._id || goal.id}
                        onClick={() => onGoalSelect(goal)}
                        sx={{
                          cursor: "pointer",
                          mb: 1.5,
                          p: 1,
                          borderRadius: 1,
                          border: activeGoalId === (goal._id || goal.id) ? '2px solid' : '1px solid',
                          borderColor: activeGoalId === (goal._id || goal.id) ? 'primary.main' : 'divider',
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <GoalCard
                          goal={goal}
                          onPriorityChange={onPriorityChange}
                          onDateChange={onDateChange}
                          onGoalArchived={handleGoalArchived}
                        />
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </>
            )}
          </>
        )}
      </Box>

      {showGoalModal && (
        <OnboardingModal
          open={showGoalModal}
          onClose={handleCloseGoalModal}
          userId={getUserId()}
          isGuest={isGuest}
          onComplete={handleCloseGoalModal}
        />
      )}
    </Box>
  );
}

Sidebar.propTypes = {
  onGoalSelect: PropTypes.func.isRequired,
  onAddGoalClick: PropTypes.func,
  onPriorityChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  activeGoalId: PropTypes.string,
  onGoalUpdate: PropTypes.func,
};
