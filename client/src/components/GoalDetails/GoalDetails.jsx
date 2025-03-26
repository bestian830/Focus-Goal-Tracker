import { useState, useEffect } from 'react';
import ProgressTimeline from './ProgressTimeline';
import DailyTasks from './DailyTasks';

export default function GoalDetails() {
  const [goalDetail, setGoalDetail] = useState(null);

  useEffect(() => {
    // actual logic (later enabled)
    /*
    fetch('/api/goal-detail?id=1') // dynamic id later adjusted
      .then(res => res.json())
      .then(data => setGoalDetail(data))
      .catch(err => console.log(err));
    */

    // mock data
    const mockGoalDetail = {
      title: 'Learn Advanced JavaScript',
      description: 'Master modern JavaScript concepts and frameworks',
      progress: 4,
      tasks: [
        { id: 1, text: 'Complete ES6 Modules', completed: false },
        { id: 2, text: 'Practice Promises', completed: true }
      ]
    };
    setGoalDetail(mockGoalDetail);
  }, []);

  if (!goalDetail) return <div className="goal-details">Loading...</div>;

  return (
    <div className="goal-details">
      <h3>{goalDetail.title}</h3>
      <p>{goalDetail.description}</p>
      <ProgressTimeline progress={goalDetail.progress} />
      <DailyTasks tasks={goalDetail.tasks} />
    </div>
  );
}
