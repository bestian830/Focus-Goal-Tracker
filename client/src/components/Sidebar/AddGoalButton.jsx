import React from 'react';

export default function AddGoalButton({ onAddGoalClick }) {
  return (
    <button className="add-goal-btn" onClick={onAddGoalClick}>Add Goal</button>
  );
}
