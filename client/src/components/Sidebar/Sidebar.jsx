import { useState, useEffect } from "react";
import GoalCard from "./GoalCard";
import AddGoalButton from "./AddGoalButton";

export default function Sidebar() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    // 实际逻辑 (后期启用)
    /*
    fetch('/api/goals')
      .then(res => res.json())
      .then(data => setGoals(data))
      .catch(err => console.log(err));
    */

    // 假数据
    const mockGoals = [
      { id: 1, title: "Learn Advanced JavaScript", priority: "High" },
      { id: 2, title: "Complete UI/UX Course", priority: "Medium" },
    ];
    setGoals(mockGoals);
  }, []);

  return (
    <div className="sidebar">
      <AddGoalButton />
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
