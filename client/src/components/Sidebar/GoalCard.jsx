export default function GoalCard({ goal }) {
  return (
    <div className="goal-card">
      <h5>{goal.title}</h5>
      <span className={`priority ${goal.priority.toLowerCase()}`}>{goal.priority} Priority</span>
    </div>
  );
}
