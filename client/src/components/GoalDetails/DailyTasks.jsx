import React from 'react';
import { Box, Typography, Checkbox, FormControlLabel } from '@mui/material';

/**
 * DailyTasks component displays a list of daily tasks with checkboxes
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects with id, text, and completed
 * @param {Function} props.onTaskStatusChange - Callback when task status changes
 */
export default function DailyTasks({ tasks, onTaskStatusChange }) {
  return (
    <Box className="daily-tasks" sx={{ my: 2, p: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Daily Tasks
      </Typography>
      
      {tasks && tasks.length > 0 ? (
        tasks.map(task => (
          <Box key={task.id} sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={task.completed}
                  onChange={(e) => onTaskStatusChange && onTaskStatusChange(task.id, e.target.checked)}
                />
              }
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body1" 
                    component="span" 
                    fontWeight={500}
                    sx={{ 
                      color: task.completed ? 'success.main' : 'text.primary',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}
                  >
                    {task.text}
                  </Typography>
                </Box>
              }
              sx={{ display: 'flex', mr: 0 }}
            />
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No daily tasks set for this goal.
        </Typography>
      )}
    </Box>
  );
}
