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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import apiService from "../../services/api";
import axios from 'axios';

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
    // Allow clearing the date
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
      <div className={`goal-card ${goalStatus === "active" ? "active" : ""}`}>
        {/* Header with Title and Archive Button */}
        <div className="goal-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Goal Title */}
          <h5 style={{ margin: 0, flexGrow: 1, marginRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
             {goalTitle}
          </h5>

          {/* Archive Button */}
          <Tooltip 
            title={isArchived ? "Already Archived" : "Complete and Archive"} 
            placement="top-end"
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
            <div style={{ marginLeft: '4px' }}> {/* Add some margin for spacing */}
              <IconButton
                aria-label="complete and archive goal"
                onClick={(e) => { e.stopPropagation(); handleArchive(); }} // Prevent card click while archiving
                disabled={isArchiving || isArchived}
                size="medium"
                sx={{ 
                  color: isArchived ? 'text.disabled' : 'action.active',
                  padding: '6px',
                  '&:hover': {
                    color: isArchived ? 'text.disabled' : 'primary.main',
                    backgroundColor: isArchived ? 'transparent' : 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                {isArchiving ? <CircularProgress size={24} color="inherit"/> : <ArchiveIcon sx={{ fontSize: '1.5rem' }} />}
              </IconButton>
            </div>
          </Tooltip>
        </div>

        {/* Content Area */}
        <div className="goal-card-content">
          {/* Priority Section */}
          <div className="priority-container">
            <Chip
              size="small"
              label={`Prio: ${priorityNumber}`}
              className={`priority-chip priority-${priorityClass}`}
              sx={{ height: 'auto', '& .MuiChip-label': { lineHeight: '1.2' } }}
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
                className="edit-priority-btn"
                onClick={handleOpenMenu}
                aria-label="Edit Priority"
                sx={{ padding: '4px' }}
                disabled={isArchived}
              >
                <EditIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={() => handlePriorityChange("High")}>Priority: 1 (High)</MenuItem>
              <MenuItem onClick={() => handlePriorityChange("Medium")}>Priority: 2 (Medium)</MenuItem>
              <MenuItem onClick={() => handlePriorityChange("Low")}>Priority: 3 (Low)</MenuItem>
            </Menu>
          </div>

          {/* Due Date */}
          <div className="due-date-container">
            {isArchived ? (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Completed on
                </Typography>
                <Typography variant="body2">
                  {targetDate ? new Date(targetDate).toLocaleDateString() : 'Unknown date'}
                </Typography>
              </Box>
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
                      sx: { marginTop: 1 }
                    },
                    actionBar: { actions: ['clear', 'today', 'accept'] }
                  }}
                   sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            )}
          </div>

          {/* Display archive error subtly */}
          {archiveError && <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'right', marginTop: 0.5 }}>Archive failed</Typography>}
        </div>
      </div>
  );
}
