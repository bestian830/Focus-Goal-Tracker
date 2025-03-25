import { useState } from 'react';

export default function TaskItem({ task }) {
  const [completed, setCompleted] = useState(task.completed);

  const handleToggle = () => {
    setCompleted(!completed);
    // 实际项目中这里应该有API调用来更新任务状态
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
