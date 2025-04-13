import React, { useState, useEffect } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from '@mui/icons-material/Archive';
import EventIcon from '@mui/icons-material/Event';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import apiService from "../../services/api";
import axios from 'axios';
import styles from './GoalCard.module.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export default function GoalCard({ goal, onPriorityChange, onDateChange, onGoalArchived }) {
  // Hooks must be called at the top level
  const [anchorEl, setAnchorEl] = useState(null);
  const [priority, setPriority] = useState(goal?.priority || "Medium");
  const [targetDate, setTargetDate] = useState(() => {
    const initialDate = goal?.targetDate || goal?.dueDate;
    return initialDate ? new Date(initialDate) : null;
  });
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState(null);

  // 创建自定义主题，包括完整的阴影数组
  const defaultTheme = createTheme({
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
      '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
      '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
      '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
      '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
      '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
      '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
      '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
      '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
      '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
      '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
      '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
      '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
      '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
      '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
      '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    palette: {
      primary: {
        main: '#0D5E6D',
        light: '#4CD7D0',
        dark: '#0a4a56',
        contrastText: '#fff',
      },
    },
  });

  // Early return check AFTER hooks
  if (!goal || typeof goal !== "object") {
    console.error("Invalid goal object received by GoalCard:", goal);
    return (
      <div className="goal-card error">
        <h5>Invalid Goal Data</h5>
      </div>
    );
  }

  // Logging for rendering
  console.log("Rendering GoalCard for:", {
    id: goal._id || goal.id,
    title: goal.title,
    priority: goal.priority,
    status: goal.status,
    targetDate: goal.targetDate || goal.dueDate,
  });

  // Effect to sync state with props
  useEffect(() => {
    // Update priority if prop changes
    if (goal.priority && goal.priority !== priority) {
      console.log(
        `Updating priority state from ${priority} to ${goal.priority}`
      );
      setPriority(goal.priority);
    }

    // Update target date if prop changes
    const newDate = goal.targetDate || goal.dueDate;
    if (newDate) {
      const newDateObj = new Date(newDate);
      // Check if date actually changed to avoid unnecessary state updates
      const needsUpdate =
        !targetDate || targetDate.getTime() !== newDateObj.getTime();

      if (needsUpdate) {
        console.log(`[date] goal property changed, updating date state`, {
          goalID: goal._id || goal.id,
          newDate: newDateObj.toISOString(),
          oldDate: targetDate ? targetDate.toISOString() : "none",
        });
        setTargetDate(newDateObj);
      }
    } else if (targetDate !== null) { // Handle case where date is removed from props
        console.log(`[date] goal property removed, clearing date state`, {
          goalID: goal._id || goal.id,
          oldDate: targetDate ? targetDate.toISOString() : "none",
        });
       setTargetDate(null);
    }
  }, [goal.priority, goal.targetDate, goal.dueDate, priority, targetDate]); // Add priority and targetDate to dependency array

  // Priority mapping
  const priorityMap = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const priorityClass = priority.toLowerCase();
  const priorityNumber = priorityMap[priority] || 2;

  // Menu handlers
  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Priority change handler
  const handlePriorityChange = async (newPriority) => {
    try {
      handleCloseMenu();
      if (newPriority === priority) return;

      console.log(`Changing priority from ${priority} to ${newPriority}`);
      const goalId = goal._id || goal.id;
      if (!goalId) {
        console.error("Cannot update priority: missing goal ID");
        return;
      }

      const oldPriority = priority;
      setPriority(newPriority); // Optimistic UI update

      if (onPriorityChange) {
        onPriorityChange(goalId, newPriority); // Notify parent immediately
      }

      try {
        const response = await apiService.goals.update(goalId, {
          priority: newPriority,
        });
        console.log(`Priority updated successfully to ${newPriority}`, response);
        // Optionally notify parent again with confirmed data
        if (response?.data?.success && response.data.data && onPriorityChange) {
           onPriorityChange(goalId, newPriority, response.data.data);
        }
      } catch (apiError) {
        console.error("API failed to update goal priority:", apiError);
        setPriority(oldPriority); // Rollback UI
        if (onPriorityChange) {
          onPriorityChange(goalId, oldPriority); // Notify parent of rollback
        }
      }
    } catch (error) {
      console.error("Failed to update goal priority:", error);
    }
  };

  // Date change handler
  const handleDateChange = async (newDate) => {
    // Only proceed if user confirmed with OK button (actionBar)
    // or cleared the date (newDate will be null)
    const dateChanged = (!newDate && targetDate) || (newDate && !targetDate) || (newDate && targetDate && newDate.getTime() !== targetDate.getTime());
    if (!dateChanged) return; 

    const goalId = goal._id || goal.id;
    if (!goalId) {
      console.error("Missing goal ID for date change");
      return;
    }

    console.log(`date changed: ${goalId}, from ${targetDate?.toISOString()} to ${newDate?.toISOString()}`);

    const oldDate = targetDate;
    setTargetDate(newDate); // Optimistic UI update

    if (onDateChange) {
      onDateChange(goalId, newDate); // Notify parent immediately
    }

    try {
      const response = await apiService.goals.update(goalId, {
        targetDate: newDate, // Pass Date object or null
      });
      console.log("date updated successfully:", response.data);
      // Optionally notify parent again with confirmed data
      if (response?.data?.success && response.data.data && onDateChange) {
        onDateChange(goalId, newDate, response.data.data);
      }
    } catch (error) {
      console.error("date update failed:", error);
      setTargetDate(oldDate); // Rollback UI
      if (onDateChange) {
        onDateChange(goalId, oldDate); // Notify parent of rollback
      }
    }
  };

  // Archive handler
  const handleArchive = async () => {
    if (isArchiving) return;
    setIsArchiving(true);
    setArchiveError(null);
    const goalId = goal._id || goal.id; // Get goalId here
    if (!goalId) {
       console.error("Cannot archive goal: missing goal ID");
       setIsArchiving(false);
       return;
    }

    try {
      const response = await axios.put(
        `/api/goals/${goalId}/status`, // Use goalId variable
        { status: 'archived' },
        { withCredentials: true }
      );
      if (response.data && response.data.success) {
        console.log(`Goal ${goalId} archived successfully.`);
        if (onGoalArchived) {
          onGoalArchived(goalId); // Pass goalId to the callback
        }
      } else {
         throw new Error(response.data?.error?.message || 'Failed to archive goal');
      }
    } catch (err) {
      console.error(`Error archiving goal ${goalId}:`, err);
      setArchiveError(err.message || 'Could not archive goal.');
      setIsArchiving(false); // Allow retry on failure
    }
    // Don't set isArchiving to false on success, as the card will be removed
  };

  // Safe access to goal properties
  const goalTitle = goal.title || "Unnamed Goal";
  const goalStatus = goal.status || "active";
  const isArchived = goalStatus === 'archived';

  return (
    <ThemeProvider theme={defaultTheme}>
      <div className={`${styles.goalCard} ${goalStatus === "active" ? styles.active : ""}`}>
        {/* Header Area */}
        <div className={styles.goalCardHeader}>
          <h5 className={styles.goalTitle}>
            <Tooltip title={isArchived ? "Goal Archived" : "Complete and archive"}>
              <div className={styles.titleActions}>
                <IconButton
                  className={styles.iconButton}
                  onClick={(e) => { e.stopPropagation(); handleArchive(); }}
                  disabled={isArchiving || isArchived}
                  size="small"
                >
                  {isArchiving ? <CircularProgress size={20} /> : <ArchiveIcon fontSize="small" />}
                </IconButton>
              </div>
            </Tooltip>
            <span className={styles.goalTitleText}>
              {goalTitle}
            </span>
            
            {/* Priority Section */}
            <Box 
              component="span" 
              className={styles.priorityContainer}
            >
              <Chip
                size="small"
                label={`Prio: ${priorityNumber}`}
                className={`${styles.priorityChip} ${
                  priority === "High" 
                    ? styles.priorityHigh 
                    : priority === "Medium" 
                      ? styles.priorityMedium 
                      : styles.priorityLow
                }`}
              />
              <Tooltip 
                title="Edit Priority" 
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontSize: '1rem',
                      fontWeight: 500,
                      padding: '8px 12px'
                    }
                  }
                }}
              >
                <IconButton
                  size="small"
                  className={styles.iconButton}
                  onClick={handleOpenMenu}
                  aria-label="Edit Priority"
                  disabled={isArchived}
                >
                  <EditIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                onClick={(e) => e.stopPropagation()}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                    borderRadius: '8px',
                    mt: 1.5,
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem 
                  onClick={() => handlePriorityChange("High")}
                  sx={{
                    backgroundColor: 'rgba(255, 127, 102, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 127, 102, 0.2)'
                    }
                  }}
                >
                  Priority: 1 (High)
                </MenuItem>
                <MenuItem 
                  onClick={() => handlePriorityChange("Medium")}
                  sx={{
                    backgroundColor: 'rgba(76, 215, 208, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 215, 208, 0.2)'
                    }
                  }}
                >
                  Priority: 2 (Medium)
                </MenuItem>
                <MenuItem 
                  onClick={() => handlePriorityChange("Low")}
                  sx={{
                    backgroundColor: 'rgba(13, 94, 109, 0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(13, 94, 109, 0.1)'
                    }
                  }}
                >
                  Priority: 3 (Low)
                </MenuItem>
              </Menu>
            </Box>
          </h5>
        </div>

        {/* Date Section */}
        <div className={styles.cardFooter}>
          {isArchived ? (
            <div className={styles.dueDate}>
              <EventIcon className={styles.dateIcon} />
              <span>Completed on {targetDate ? new Date(targetDate).toLocaleDateString() : 'Unknown date'}</span>
            </div>
          ) : (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Target Date"
                value={targetDate}
                onChange={handleDateChange}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    size: "small",
                    InputLabelProps: { shrink: true },
                  },
                  actionBar: { actions: ['clear', 'today', 'accept'] },
                  // Force day selection mode to close only on accept
                  day: { 
                    disableAutoFocus: true,
                    autoFocus: false
                  }
                }}
                closeOnSelect={false} // Prevent auto-close on day selection
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          )}
          
          {/* Display archive error subtly */}
          {archiveError && <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'right', marginTop: 0.5 }}>Archive failed</Typography>}
        </div>
      </div>
    </ThemeProvider>
  );
}
