import React from 'react';
import { Card, CardContent, Checkbox, Typography, Chip } from '@mui/material';

/**
 * TaskCard 組件 - 顯示單個任務
 * 
 * @param {Object} props
 * @param {Object} props.task - 任務對象
 * @param {Function} props.onTaskStatusChange - 任務狀態變更回調
 * @returns {JSX.Element}
 */
function TaskCard({ task, onTaskStatusChange }) {
  if (!task) return null;

  const handleStatusChange = (event) => {
    if (onTaskStatusChange) {
      onTaskStatusChange(task._id, event.target.checked);
    }
  };

  // 處理任務狀態標籤的顏色
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card className="task-card">
      <CardContent>
        <div className="task-header">
          <div className="task-status">
            <Checkbox 
              checked={task.status === 'completed'} 
              onChange={handleStatusChange}
            />
            <Typography 
              variant="body1" 
              className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}
            >
              {task.title}
            </Typography>
          </div>
          <Chip 
            label={task.status || 'pending'} 
            color={getStatusColor(task.status)}
            size="small"
            className="task-status-chip"
          />
        </div>
        {task.description && (
          <Typography variant="body2" color="textSecondary" className="task-description">
            {task.description}
          </Typography>
        )}
        {task.dueDate && (
          <Typography variant="caption" className="task-due-date">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskCard; 