import React from 'react';
import { Box, Typography } from '@mui/material';
import TaskItem from './TaskItem';

/**
 * DailyTasks component displays a list of daily tasks with checkboxes
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects with id, text, and completed
 * @param {Function} props.onTaskStatusChange - Callback when task status changes
 */
export default function DailyTasks({ tasks, onTaskStatusChange }) {
  // Handle task status change
  const handleTaskStatusChange = (taskId, completed) => {
    if (onTaskStatusChange) {
      onTaskStatusChange(taskId, completed);
    }
  };

  return (
    <Box className="daily-tasks" sx={{ my: 2, p: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Daily Tasks
      </Typography>
      
      {tasks.length > 0 ? (
        tasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onStatusChange={handleTaskStatusChange}
          />
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No daily tasks set for this goal.
        </Typography>
      )}
    </Box>
  );
}
