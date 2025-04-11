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
  // enhanced security check, ensure goal is a valid object
  if (!goal || typeof goal !== "object") {
    console.error("Invalid goal object received by GoalCard:", goal);
    return (
      <div className="goal-card error">
        <h5>Invalid Goal Data</h5>
      </div>
    );
  }

  // detailed logging for debugging
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

  // when goal properties change, update local state
  useEffect(() => {
    if (goal.priority && goal.priority !== priority && hasLoaded) {
      console.log(
        `Updating priority state from ${priority} to ${goal.priority}`
      );
      setPriority(goal.priority);
    } else {
      setHasLoaded(true);
    }

    // update target date - enhanced logging for debugging
    const newDate = goal.targetDate || goal.dueDate;
    if (newDate) {
      const newDateObj = new Date(newDate);

      // check if current date is different from new date
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
    }
  }, [
    goal.priority,
    priority,
    hasLoaded,
    goal.targetDate,
    goal.dueDate,
    targetDate,
  ]);

  // priority mapping - text to display number
  const priorityMap = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const priorityClass = priority.toLowerCase();
  const priorityNumber = priorityMap[priority] || 2;

  // handle opening priority edit menu
  const handleOpenMenu = (event) => {
    event.stopPropagation(); // prevent triggering goal selection
    setAnchorEl(event.currentTarget);
  };

  // handle closing priority edit menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // handle priority change
  const handlePriorityChange = async (newPriority) => {
    try {
      // close menu
      handleCloseMenu();

      // if priority didn't change, do nothing
      if (newPriority === priority) return;

      console.log(`Changing priority from ${priority} to ${newPriority}`);

      // ensure goal id exists
      const goalId = goal._id || goal.id;
      if (!goalId) {
        console.error("Cannot update priority: missing goal ID");
        return;
      }

      // update local state for quick feedback
      setPriority(newPriority);

      // notify parent component priority has changed (use old data for initial update)
      if (onPriorityChange) {
        onPriorityChange(goalId, newPriority);
      }

      // update goal priority via API
      try {
        const response = await apiService.goals.update(goalId, {
          priority: newPriority,
        });
        console.log(
          `Priority updated successfully to ${newPriority}`,
          response
        );

        // if API returns updated data, notify parent component again
        if (
          response &&
          response.data &&
          response.data.success &&
          response.data.data
        ) {
          // notify parent component updated goal data, trigger re-render
          if (onPriorityChange) {
            onPriorityChange(goalId, newPriority, response.data.data);
          }
        }
      } catch (apiError) {
        console.error("API failed to update goal priority:", apiError);
        // rollback local state
        setPriority(priority);
        // notify parent component priority update failed
        if (onPriorityChange) {
          onPriorityChange(goalId, priority);
        }
      }
    } catch (error) {
      console.error("Failed to update goal priority:", error);
    }
  };

  // handle date change - fully implemented like RewardsStep
  const handleDateChange = async (newDate) => {
    if (!newDate) return;

    const goalId = goal._id || goal.id;
    if (!goalId) {
      console.error("Missing goal ID for date change");
      return;
    }

    console.log(`date changed: ${goalId}, from ${targetDate} to ${newDate}`);

    // update local state
    setTargetDate(newDate);

    // notify parent component (optional)
    if (onDateChange) {
      onDateChange(goalId, newDate);
    }

    // update directly via API
    try {
      const response = await apiService.goals.update(goalId, {
        targetDate: newDate, // pass Date object directly
      });

      console.log("date updated successfully:", response.data);

      // optional: if API returns updated data, notify parent component
      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        onDateChange
      ) {
        onDateChange(goalId, newDate, response.data.data);
      }
    } catch (error) {
      console.error("date update failed:", error);
      // rollback local state (optional)
      const originalDate = goal.targetDate
        ? new Date(goal.targetDate)
        : goal.dueDate
        ? new Date(goal.dueDate)
        : null;
      setTargetDate(originalDate);
    }
  };

  // safe get goal title and status
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
            label={`Priority: ${priorityNumber} (${priority})`}
            className={`priority-chip priority-${priorityClass}`}
          />

          <Tooltip title="Edit Priority" arrow>
            <IconButton
              size="small"
              className="edit-priority-btn"
              onClick={handleOpenMenu}
              aria-label="Edit Priority"
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
              Priority: 1 (High)
            </MenuItem>
            <MenuItem onClick={() => handlePriorityChange("Medium")}>
              Priority: 2 (Medium)
            </MenuItem>
            <MenuItem onClick={() => handlePriorityChange("Low")}>
              Priority: 3 (Low)
            </MenuItem>
          </Menu>
        </div>

        <div className="due-date-container">
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
                  helperText: "Select target completion date",
                },
              }}
            />
          </LocalizationProvider>
        </div>
      </div>
    </div>
  );
}
