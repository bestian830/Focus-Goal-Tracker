export default function AddGoalButton() {
  const handleAddGoal = () => {
    alert('Add Goal Clicked (simulation)');
  };

  return (
    <button className="add-goal-btn" onClick={handleAddGoal}>Add Goal</button>
  );
}
