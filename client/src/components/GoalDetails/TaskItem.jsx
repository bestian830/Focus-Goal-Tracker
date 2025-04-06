import { useState, useEffect } from 'react';

/**
 * TaskItem component displays a single task with checkbox
 * @param {Object} props
 * @param {Object} props.task - The task object with id, text, and completed
 * @param {Function} props.onStatusChange - Callback when task status changes
 */
export default function TaskItem({ task, onStatusChange }) {
  const [completed, setCompleted] = useState(task.completed);

  // Update local state when prop changes
  useEffect(() => {
    setCompleted(task.completed);
  }, [task.completed]);

  const handleToggle = () => {
    const newStatus = !completed;
    setCompleted(newStatus);
    
    // Call callback if provided
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <div className="task-item">
      <input 
        type="checkbox" 
        checked={completed} 
        onChange={handleToggle} 
      />
      <span className={`task-text ${completed ? 'completed' : ''}`}>
        {task.text}
      </span>
    </div>
  );
}
