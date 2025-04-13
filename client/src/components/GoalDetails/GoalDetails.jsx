import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
  Box,
  Typography,
  Fade,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArchiveIcon from "@mui/icons-material/Archive";
import DailyTasks from "./DailyTasks";
import WeeklyDailyCards from "./WeeklyDailyCards";
import GoalDeclaration from "./GoalDeclaration";
import apiService from "../../services/api";

// add inspirational quotes
const inspirationalQuotes = [
  {
    text: "The purpose of goals is not just to achieve, but to guide the direction.",
    author: "Bruce Lee"
  },
  {
    text: "Success is not the destination, but the journey of constant progress.",
    author: "Winston Churchill"
  },
  {
    text: "You don't need to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr."
  },
  {
    text: "Stick to your ideals, don't give up because of temporary difficulties.",
    author: "Madame Curie"
  },
  {
    text: "Every day you don't want to get up is an opportunity to change your life.",
    author: "Melanie Robbins"
  }
];

export default function GoalDetails({ 
  goals = [], 
  goalId, 
  onGoalDeleted, 
  refreshGoalData: parentRefreshGoalData,
  sx = {}
}) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dailyCards, setDailyCards] = useState([]);
  const [declarationOpen, setDeclarationOpen] = useState(false);
  const [isLoadingDeclaration, setIsLoadingDeclaration] = useState(false);

  // New effect to handle export button click for declaration
  useEffect(() => {
    // Function to handle export button clicks
    const handleExportButtonClick = () => {
      // Check if declaration dialog should be temporarily opened for export
      const shouldOpenDeclaration = document.querySelector('[data-export-id="goal-declaration-content"]') === null;
      
      if (shouldOpenDeclaration && selectedGoal) {
        console.log("Opening declaration dialog for export");
        handleOpenDeclaration();
      }
    };

    // Add event listener for export button clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('button') && e.target.textContent.includes('Export')) {
        handleExportButtonClick();
      }
    });

    return () => {
      // Clean up event listener
      document.removeEventListener('click', handleExportButtonClick);
    };
  }, [selectedGoal]);

  // select goal from goals array
  useEffect(() => {
    console.log("Goals in GoalDetails:", goals);
    // if there is a goal, select the first one as the default
    if (goals.length > 0 && !selectedGoal) {
      console.log("Setting first goal as default:", goals[0]);
      setSelectedGoal(goals[0]);
    }
  }, [goals, selectedGoal]);

  // select specific goal by goalId
  useEffect(() => {
    console.log("goalId in GoalDetails:", goalId);
    if (!goalId) return;

    // Save current goal data before switching to prevent data loss
    if (selectedGoal && selectedGoal._id !== goalId && selectedGoal.dailyCards) {
      console.log("Saving current goal data before switching to new goal");
      
      // Save selected goal data to database to prevent record loss when switching goals
      const saveCurrentGoalData = async () => {
        try {
          console.log("Attempting to save goal data before switch", selectedGoal._id);
          // Ensure we've saved any pending dailyCards updates
          if (dailyCards && dailyCards.length > 0) {
            // We don't need to update the whole goal, just ensure dailyCards are saved
            const latestGoal = {
              ...selectedGoal,
              dailyCards: JSON.parse(JSON.stringify(dailyCards)) // Deep copy to avoid reference issues
            };
            
            // Update goal with latest dailyCards data
            await apiService.goals.update(selectedGoal._id, { 
              dailyCards: latestGoal.dailyCards 
            });
            console.log("Successfully saved goal data before switching");
          }
        } catch (error) {
          console.error("Error saving goal data before switch:", error);
        }
      };
      
      // Execute the save operation
      saveCurrentGoalData();
    }

    // get current user ID
    const getCurrentUserId = () => {
      const userId = localStorage.getItem("userId");
      const tempId = localStorage.getItem("tempId");
      return userId || tempId;
    };

    const currentUserId = getCurrentUserId();
    console.log("current user ID:", currentUserId);

    try {
      // select from goals array and check user ID
      if (goals && goals.length > 0) {
        const goal = goals.find((g) => {
          const matchId = (g._id === goalId || g.id === goalId);
          const matchUserId = (g.userId === currentUserId);
          
          console.log("goal matching check:", {
            goalId: g._id || g.id,
            matchId,
            goalUserId: g.userId,
            currentUserId,
            matchUserId
          });

          return matchId && matchUserId;
        });

        if (goal) {
          console.log("found matching goal in local goals array:", goal);
          setSelectedGoal(goal);
          return;
        } else {
          console.log(`no goal found in local goals array with ID ${goalId}, but user ID matches, trying to get from API`);
        }
      } else {
        console.log("goals array is empty or invalid");
      }
      
      // if no goal found in local goals array, try to get from API directly
      const fetchGoalDetails = async () => {
        try {
          console.log(`trying to get goal details from API, ID: ${goalId}`);
          const response = await apiService.goals.getById(goalId);
          
          if (response && response.data && response.data.data) {
            const apiGoal = response.data.data;
            
            // extra check if user ID matches
            if (apiGoal.userId !== currentUserId) {
              console.error("goal does not belong to current user");
              return;
            }
            
            console.log("got goal details from API:", apiGoal);
            setSelectedGoal(apiGoal);
          } else {
            console.error("API did not return valid goal data");
          }
        } catch (error) {
          console.error(`failed to get goal details from API, ID: ${goalId}`, error);
        }
      };
      
      fetchGoalDetails();
    } catch (error) {
      console.error("error selecting goal:", error);
    }
  }, [goalId, goals]);

  // when selected goal changes, update daily cards data
  useEffect(() => {
    if (selectedGoal && selectedGoal.dailyCards) {
      setDailyCards(selectedGoal.dailyCards);
    } else {
      setDailyCards([]);
    }
  }, [selectedGoal]);

  // handle opening delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Handle deleting the goal
  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;

    try {
      setIsDeleting(true);

      // Call API to delete the goal
      await apiService.goals.delete(selectedGoal._id || selectedGoal.id);

      console.log(
        `Goal deleted successfully: ${selectedGoal._id || selectedGoal.id}`
      );

      // Close dialog
      setDeleteDialogOpen(false);

      // Clear selected goal
      setSelectedGoal(null);

      // Notify parent component
      if (onGoalDeleted) {
        onGoalDeleted(selectedGoal._id || selectedGoal.id);
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // handle DailyCards update
  const handleDailyCardsUpdate = (updatedCards) => {
    // use deep copy to ensure not sharing object references
    const safeUpdatedCards = JSON.parse(JSON.stringify(updatedCards));
    
    console.log('received daily cards update in GoalDetails:', {
      cardCount: safeUpdatedCards.length,
      firstCardStatus: safeUpdatedCards[0]?.taskCompletions
    });
    
    // update local state
    setDailyCards(safeUpdatedCards);
    
    // update selectedGoal's dailyCards
    if (selectedGoal) {
      setSelectedGoal({
        ...selectedGoal,
        dailyCards: safeUpdatedCards
      });
    }
  };

  // handle opening goal declaration dialog
  const handleOpenDeclaration = () => {
    if (!selectedGoal) return;
    
    // check if goal has declaration field
    if (!selectedGoal.declaration || !selectedGoal.declaration.content) {
      console.log("in GoalDetails: goal is missing declaration data, generating");
      
      // generate declaration content function
      const generateDeclarationFromGoalData = (goal) => {
        const formattedDate = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'no date set';
        const dailyTask = goal.dailyTasks && goal.dailyTasks.length > 0 ? goal.dailyTasks[0] : 'daily commitment';
        const reward = goal.rewards && goal.rewards.length > 0 ? goal.rewards[0] : 'appropriate reward';
        const resource = goal.resources && goal.resources.length > 0 ? goal.resources[0] : 'necessary preparation';
        const motivation = goal.motivation || goal.description || 'this is a deeply meaningful pursuit for me';
        
        return `${goal.title}

This goal isn't just another item on my list—it's something I genuinely want to achieve.

I'm stepping onto this path because ${motivation}. It's something deeply meaningful to me, a desire that comes straight from my heart.

I trust that I have what it takes, because I already have ${resource} in my hands—these are my sources of confidence and strength as I move forward.

I don't need to wait until I'm "fully ready." The best moment to start is right now. Next, I'll take my first step and let the momentum carry me onward.

I understand that as long as I commit to ${dailyTask} each day, little by little, I'll steadily move closer to the goal I'm eager to achieve.

Every time I complete my daily milestone, I'll reward myself with something small and meaningful: ${reward}.

I've set a deadline for myself: ${formattedDate}. I know there might be ups and downs along the way, but I deeply believe I have enough resources and strength to keep going.

Because the path is already beneath my feet—it's really not that complicated. All I need to do is stay focused and adjust my pace when needed ^^.`;
      };
      
      // create new temporary declaration object for display
      const declarationContent = generateDeclarationFromGoalData(selectedGoal);
      const declarationData = {
        content: declarationContent,
        updatedAt: new Date()
      };
      
      // update database simultaneously
      const updatedGoal = { ...selectedGoal, declaration: declarationData };
      apiService.goals.update(updatedGoal._id, { declaration: declarationData })
        .then(() => {
          console.log("宣言已成功保存到数据库");
          // update local state
          setSelectedGoal(updatedGoal);
          // open declaration dialog
          setDeclarationOpen(true);
        })
        .catch(error => {
          console.error("保存宣言时出错:", error);
          // even if saving fails, still show declaration dialog, but use the temporarily generated content
          setDeclarationOpen(true);
        });
    } else {
      // goal already has declaration, open dialog directly
      setDeclarationOpen(true);
    }
  };
  
  // handle closing goal declaration dialog
  const handleCloseDeclaration = async (updatedGoalData = null, shouldClose = true) => {
    // If we received updated goal data directly from the declaration component
    if (updatedGoalData) {
      console.log("Received direct goal update from declaration component:", {
        title: updatedGoalData.title,
        motivation: updatedGoalData.motivation,
        detailsMotivation: updatedGoalData.details?.motivation,
        description: updatedGoalData.description
      });
      
      // Extract motivation from all possible sources
      const newMotivation = updatedGoalData.details?.motivation || 
                            updatedGoalData.motivation || 
                            updatedGoalData.description;
      
      // Make a complete copy of the goal with updated fields
      const completeUpdatedGoal = {
        ...selectedGoal,
        ...updatedGoalData,
        // Ensure motivation is accessible in all possible ways
        motivation: newMotivation,
        description: updatedGoalData.description || newMotivation,
        details: {
          ...(selectedGoal?.details || {}),
          ...(updatedGoalData.details || {}),
          motivation: newMotivation
        }
      };
      
      console.log("Updated goal with motivation to display:", {
        finalMotivation: completeUpdatedGoal.motivation,
        finalDetailsMotivation: completeUpdatedGoal.details?.motivation,
        finalDescription: completeUpdatedGoal.description
      });
      
      // Update selectedGoal with the complete data
      setSelectedGoal(completeUpdatedGoal);
      
      // Force a re-render by setting a state that will cause a UI update
      setDeclarationOpen(prevState => {
        if (!shouldClose) return prevState;
        return false;
      });
      
      // If we shouldn't close the dialog, return early
      if (!shouldClose) {
        return;
      }
    }
    
    // Close the dialog if needed
    setDeclarationOpen(false);
    
    // If no direct update was provided, refresh from API
    if (!updatedGoalData && selectedGoal) {
      try {
        const goalId = selectedGoal._id || selectedGoal.id;
        console.log("close declaration dialog and refresh goal data:", goalId);
        
        // use Promise.all to refresh goal data and daily cards data simultaneously
        Promise.all([
          // refresh goal data
          refreshGoalData(goalId).catch(error => {
            console.error("failed to refresh goal data in backend:", error);
          }),
          
          // refresh daily cards data
          (async () => {
            try {
              console.log("refresh daily cards data");
              const response = await apiService.goals.getById(goalId);
              if (response.data && response.data.data && response.data.data.dailyCards) {
                console.log("got latest daily cards data:", response.data.data.dailyCards.length, "cards");
                setDailyCards(response.data.data.dailyCards);
              }
            } catch (error) {
              console.error("failed to get daily cards data:", error);
            }
          })()
        ]).catch(error => {
          // consider adding a lightweight notification, but not blocking UI
          console.error("data refresh failed:", error);
        });
      } catch (error) {
        console.error("failed to handle closing declaration dialog:", error);
      }
    }
  };
  
  // Function to refresh goal data from API
  const refreshGoalData = async (goalId) => {
    console.log(`Refreshing goal data for ID: ${goalId}`);
    if (!goalId) {
      console.warn('Cannot refresh goal data: No goalId provided');
      return;
    }
    
    try {
      // Use the getById endpoint which returns complete goal data
      const response = await apiService.goals.getById(goalId);
      
      if (response && response.data && response.data.data) {
        const refreshedGoal = response.data.data;
        console.log('Successfully refreshed goal data:', {
          title: refreshedGoal.title,
          dailyCardsCount: refreshedGoal.dailyCards ? refreshedGoal.dailyCards.length : 0
        });
        
        // Log a sample of the dailyCards for debugging
        if (refreshedGoal.dailyCards && refreshedGoal.dailyCards.length > 0) {
          console.log('Sample of refreshed dailyCards:', {
            firstCard: {
              date: refreshedGoal.dailyCards[0].date,
              hasTaskCompletions: !!refreshedGoal.dailyCards[0].taskCompletions,
              recordsCount: refreshedGoal.dailyCards[0].records ? refreshedGoal.dailyCards[0].records.length : 0
            }
          });
        }
        
        // Update local state with refreshed data
        setSelectedGoal(refreshedGoal);
        setDailyCards(refreshedGoal.dailyCards || []);
        
        // Also call parent refresh if available
        if (parentRefreshGoalData) {
          parentRefreshGoalData(goalId);
        }
        
        return refreshedGoal; // Return the updated goal data
      } else {
        console.error('Failed to refresh goal data: Invalid response format');
      }
    } catch (error) {
      console.error('Error refreshing goal data:', error);
    }
    
    return null;
  };
  
  // 
  const handleSaveDeclaration = async (goalId, updatedGoal) => {
    try {
      console.log("start saving declaration data:", { 
        originalGoalId: goalId, 
        updatedGoal: {
          title: updatedGoal.title,
          hasDeclaration: !!updatedGoal.declaration
        }
      });

      // enhance ID validation
      const safeGoalId = goalId || 
        (selectedGoal?._id) || 
        (selectedGoal?.id) || 
        updatedGoal?._id || 
        updatedGoal?.id;

      if (!safeGoalId) {
        console.error("cannot determine goal ID, update failed");
        throw new Error("Invalid Goal ID");
      }

      console.log("using safe goal ID:", safeGoalId);

      // prepare update data
      const fullUpdateData = {
        ...updatedGoal,
        _id: safeGoalId  // ensure ID consistency
      };

      // call API to update
      const response = await apiService.goals.update(safeGoalId, fullUpdateData);
      
      // ensure complete data is returned
      const updatedGoalData = response?.data?.data || {
        ...selectedGoal,
        ...fullUpdateData
      };

      // update local state
      setSelectedGoal(prevGoal => ({
        ...prevGoal,
        ...updatedGoalData,
        _id: safeGoalId  // force ID setting
      }));

      // notify parent component to update globally
      if (parentRefreshGoalData) {
        try {
          await parentRefreshGoalData(safeGoalId);
        } catch (refreshError) {
          console.warn("parent component update failed", refreshError);
        }
      }

      return {
        data: updatedGoalData,
        status: 200
      };
    } catch (error) {
      console.error("failed to save declaration:", error);
      throw error;
    }
  };

  // if no goal, show prompt information
  if (goals.length === 0 && !goalId) {
    return (
      <div className="goal-details empty-state">
        <h3>no goal set</h3>
        <p>click "add goal" button to start your first goal</p>
      </div>
    );
  }

  // if no selected goal, show loading state
  if (!selectedGoal) return <div className="goal-details">Loading...</div>;

  console.log("Selected goal in render:", selectedGoal);

  // build dailyTasks data
  const dailyTasks = selectedGoal.checkpoints
    ? selectedGoal.checkpoints
        .filter((cp) => cp.isDaily)
        .map((cp) => ({
          id: cp._id,
          text: cp.title,
          completed: cp.isCompleted,
        }))
    : [];

  // if there is dailyTask in currentSettings, also add to task list
  if (selectedGoal.currentSettings && selectedGoal.currentSettings.dailyTask) {
    // check if the task already exists
    const taskExists = dailyTasks.some(
      (task) => task.text === selectedGoal.currentSettings.dailyTask
    );

    if (!taskExists) {
      dailyTasks.push({
        id: "daily-" + Date.now(),
        text: selectedGoal.currentSettings.dailyTask,
        completed: false, // default not completed
      });
    }
  }

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    return inspirationalQuotes[randomIndex];
  };

  return (
    <Box className="goal-details" sx={{ ...sx }}>
      <Box
        className="goal-header"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3>{selectedGoal.title}</h3>
          {selectedGoal.status === 'archived' && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Chip 
                label="Archived" 
                color="default" 
                size="small"
                icon={<ArchiveIcon fontSize="small" />}
                sx={{ 
                  mr: 1, 
                  backgroundColor: 'rgba(0,0,0,0.08)', 
                  '& .MuiChip-icon': { 
                    color: 'text.secondary',
                    ml: 0.5 
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Completed on: {new Date(selectedGoal.targetDate || selectedGoal.completedAt || new Date()).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </div>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* declaration button */}
          <Tooltip title="View goal declaration">
            <IconButton
              color="primary"
              size="small"
              onClick={handleOpenDeclaration}
              aria-label="View goal declaration"
              sx={{ marginTop: "8px", marginRight: "8px" }}
              disabled={isLoadingDeclaration}
            >
              {isLoadingDeclaration ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <MenuBookIcon />
              )}
            </IconButton>
          </Tooltip>
          
          {/* delete button */}
          <IconButton
            color="error"
            size="small"
            onClick={handleOpenDeleteDialog}
            aria-label="Delete goal"
            sx={{ marginTop: "8px" }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Typography 
        variant="body1" 
        key={`goal-motivation-${selectedGoal._id}-${Date.now()}`}
        sx={{ 
          fontSize: '1.1rem',
          fontStyle: 'italic',
          color: 'text.primary',
          my: 2,
          px: 1,
          py: 1.5,
          borderLeft: '4px solid',
          borderColor: selectedGoal.status === 'archived' ? 'grey.400' : 'primary.main',
          backgroundColor: selectedGoal.status === 'archived' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '0 4px 4px 0',
          ...(selectedGoal.status === 'archived' && { color: 'text.secondary' })
        }}
      >
        I want to <strong>{selectedGoal.title}</strong>, because{' '}
        <span style={{ color: selectedGoal.status === 'archived' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.7)' }}>
          {(() => {
            const motivationValue = (selectedGoal.details && selectedGoal.details.motivation) || 
                                   selectedGoal.motivation || 
                                   selectedGoal.description || 
                                   "this goal is meaningful to my personal growth";
            console.log("Displaying motivation:", motivationValue);
            return motivationValue;
          })()}
        </span>
      </Typography>

      {/* Vision Image and inspirational quote */}
      <Box className="vision-section" sx={{ my: 3, textAlign: 'center' }}>
        {/* support both new and old data structures, prioritize new structure */}
        {(selectedGoal.visionImageUrl || (selectedGoal.details && selectedGoal.details.visionImage)) ? (
          <Fade in={true} timeout={800}>
            <Box>
              <img
                src={selectedGoal.visionImageUrl || (selectedGoal.details && selectedGoal.details.visionImage)}
                alt="goal vision"
                style={{ 
                  maxWidth: "100%", 
                  maxHeight: "250px", 
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }}
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  mt: 2, 
                  fontStyle: 'italic', 
                  color: 'text.secondary',
                  maxWidth: "80%",
                  mx: 'auto'
                }}
              >
                "{getRandomQuote().text}"
                <Typography component="span" variant="body2" sx={{ display: 'block', mt: 0.5 }}>
                  — {getRandomQuote().author}
                </Typography>
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Fade in={true} timeout={800}>
            <Box sx={{ 
              py: 4, 
              px: 3, 
              bgcolor: 'background.paper', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              maxWidth: "90%",
              mx: 'auto'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontStyle: 'italic', 
                  color: 'text.primary',
                  mb: 1
                }}
              >
                "{getRandomQuote().text}"
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                — {getRandomQuote().author}
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>

      {/* weekly DailyCards display */}
      <WeeklyDailyCards
        goal={selectedGoal}
        dailyCards={dailyCards}
        onCardsUpdate={handleDailyCardsUpdate}
        onViewDeclaration={handleOpenDeclaration}
        isArchived={selectedGoal.status === 'archived'}
      />

      {/* <DailyTasks tasks={dailyTasks} /> */}

      {/* goal declaration dialog */}
      <GoalDeclaration
        goal={selectedGoal}
        isOpen={declarationOpen}
        onClose={handleCloseDeclaration}
        onSave={handleSaveDeclaration}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the goal "{selectedGoal?.title}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteGoal}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

GoalDetails.propTypes = {
  goals: PropTypes.array.isRequired,
  goalId: PropTypes.string,
  onGoalDeleted: PropTypes.func.isRequired,
  refreshGoalData: PropTypes.func.isRequired,
  sx: PropTypes.object,
};
