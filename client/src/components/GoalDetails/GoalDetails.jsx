import { useState, useEffect } from 'react';
import ProgressTimeline from './ProgressTimeline';
import DailyTasks from './DailyTasks';

export default function GoalDetails({ goals = [] }) {
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    // 如果有目标，选择第一个作为默认显示
    if (goals.length > 0 && !selectedGoal) {
      setSelectedGoal(goals[0]);
    }
  }, [goals, selectedGoal]);

  // 如果没有目标，显示提示信息
  if (goals.length === 0) {
    return (
      <div className="goal-details empty-state">
        <h3>还没有设定目标</h3>
        <p>点击"添加目标"按钮开始你的第一个目标</p>
      </div>
    );
  }

  // 如果没有选中的目标，显示加载状态
  if (!selectedGoal) return <div className="goal-details">Loading...</div>;

  // 构建dailyTasks数据
  const dailyTasks = selectedGoal.checkpoints
    ? selectedGoal.checkpoints
      .filter(cp => cp.isDaily)
      .map(cp => ({
        id: cp._id,
        text: cp.title,
        completed: cp.isCompleted
      }))
    : [];

  // 如果有currentSettings中的dailyTask，也添加到任务列表
  if (selectedGoal.currentSettings && selectedGoal.currentSettings.dailyTask) {
    // 查找是否已经有相同的任务
    const taskExists = dailyTasks.some(task => 
      task.text === selectedGoal.currentSettings.dailyTask
    );
    
    if (!taskExists) {
      dailyTasks.push({
        id: 'daily-' + Date.now(),
        text: selectedGoal.currentSettings.dailyTask,
        completed: false // 默认未完成
      });
    }
  }

  return (
    <div className="goal-details">
      <div className="goals-selector">
        {goals.map(goal => (
          <button
            key={goal._id}
            className={`goal-tab ${selectedGoal._id === goal._id ? 'active' : ''}`}
            onClick={() => setSelectedGoal(goal)}
          >
            {goal.title}
          </button>
        ))}
      </div>
      
      <h3>{selectedGoal.title}</h3>
      <p>{selectedGoal.description}</p>
      
      {selectedGoal.details && selectedGoal.details.visionImage && (
        <div className="vision-image">
          <img 
            src={selectedGoal.details.visionImage} 
            alt="目标愿景" 
            style={{ maxWidth: '100%', maxHeight: '200px' }}
          />
        </div>
      )}
      
      <ProgressTimeline progress={selectedGoal.checkpoints ? 
        (selectedGoal.checkpoints.filter(cp => cp.isCompleted).length / 
         selectedGoal.checkpoints.length) * 100 : 0
      } />
      
      <DailyTasks tasks={dailyTasks} />
    </div>
  );
}
