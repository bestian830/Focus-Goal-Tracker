import { useState } from 'react';

export default function TaskItem({ task }) {
  const [completed, setCompleted] = useState(task.completed);

  const handleToggle = () => {
    setCompleted(!completed);
    // in actual project, there should be an API call to update the task status
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
