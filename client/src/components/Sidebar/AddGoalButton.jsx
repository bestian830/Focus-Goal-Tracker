import React from 'react';

export default function AddGoalButton({ onAddGoalClick, disabled }) {
  return (
    <button 
      className={`add-goal-btn ${disabled ? 'disabled' : ''}`} 
      onClick={onAddGoalClick}
      disabled={disabled}
    >
      Add Goal
    </button>
  );
}
