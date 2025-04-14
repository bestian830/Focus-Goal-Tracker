import React from 'react';
import { Box, Typography } from '@mui/material';
import TaskItem from './TaskItem';

/**
 * DailyTasks component displays a list of daily tasks with checkboxes
 * @param {Object} props
 * @param {Array} props.tasks - Array of task objects with id, text, completed and isMainTask
 * @param {Function} props.onTaskStatusChange - Callback when task status changes
 */
export default function DailyTasks({ tasks, onTaskStatusChange }) {
  // 对任务进行排序，确保主任务始终在最上方
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isMainTask) return -1;
    if (b.isMainTask) return 1;
    return 0;
  });

  return (
    <Box className="daily-tasks" sx={{ my: 2, p: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Daily Tasks
      </Typography>
      
      {sortedTasks && sortedTasks.length > 0 ? (
        sortedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onStatusChange={onTaskStatusChange}
            isMainTask={task.isMainTask}
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
