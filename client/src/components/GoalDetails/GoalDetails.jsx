import { useState, useEffect } from 'react';
import ProgressTimeline from './ProgressTimeline';
import DailyTasks from './DailyTasks';

export default function GoalDetails({ goals = [], goalId }) {
  const [selectedGoal, setSelectedGoal] = useState(null);

  // 通过 goals 数组选择目标
  useEffect(() => {
    console.log("Goals in GoalDetails:", goals);
    // 如果有目标，选择第一个作为默认显示
    if (goals.length > 0 && !selectedGoal) {
      console.log("Setting first goal as default:", goals[0]);
      setSelectedGoal(goals[0]);
    }
  }, [goals, selectedGoal]);

  // 通过 goalId 选择特定目标
  useEffect(() => { 
    console.log("goalId in GoalDetails:", goalId);
    if (!goalId) return;
    
    // 从 goals 数组中选择
    if (goals && goals.length > 0) {
      const goal = goals.find(g => g._id === goalId || g.id === goalId);
      if (goal) {
        console.log("Found goal from goals array:", goal);
        setSelectedGoal(goal);
      }
    }
  }, [goalId, goals]);

  // 如果没有目标，显示提示信息
  if (goals.length === 0 && !goalId) {
    return (
      <div className="goal-details empty-state">
        <h3>还没有设定目标</h3>
        <p>点击"添加目标"按钮开始你的第一个目标</p>
      </div>
    );
  }

  // 如果没有选中的目标，显示加载状态
  if (!selectedGoal) return <div className="goal-details">Loading...</div>;

  console.log("Selected goal in render:", selectedGoal);

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
      {goals.length > 0 && (
        <div className="goals-selector">
          {goals.map(goal => (
            <button
              key={goal._id || goal.id}
              className={`goal-tab ${(selectedGoal._id === goal._id || selectedGoal.id === goal.id) ? 'active' : ''}`}
              onClick={() => setSelectedGoal(goal)}
            >
              {goal.title}
            </button>
          ))}
        </div>
      )}
      
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
      
      <ProgressTimeline progress={
        selectedGoal.progress !== undefined ? selectedGoal.progress * 10 :  // 如果有直接的进度值
        (selectedGoal.checkpoints && selectedGoal.checkpoints.length > 0 ? 
          (selectedGoal.checkpoints.filter(cp => cp.isCompleted).length / 
           selectedGoal.checkpoints.length) * 100 : 0)
      } />
      
      <DailyTasks tasks={dailyTasks} />
    </div>
  );
}
