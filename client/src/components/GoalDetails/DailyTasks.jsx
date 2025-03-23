import TaskItem from './TaskItem';

export default function DailyTasks({ tasks }) {
  return (
    <div className="daily-tasks">
      <h4>Daily Tasks</h4>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
