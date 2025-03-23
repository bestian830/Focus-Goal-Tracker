import { useState } from 'react';

export default function TaskItem({ task }) {
  const [completed, setCompleted] = useState(task.completed);

  const handleCheck = () => {
    setCompleted(!completed);

    // 实际逻辑 (后期启用)
    /*
    fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    */
  };

  return (
    <div className="task-item">
      <input type="checkbox" checked={completed} onChange={handleCheck} />
      <span className={completed ? 'completed' : ''}>{task.text}</span>
    </div>
  );
}
