import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * MainTask Store - 管理主任务的全局状态
 * 确保在 GoalDeclaration 更新时，主任务状态能够同步到其他组件
 */
const useMainTaskStore = create(
  devtools(
    persist(
      (set, get) => ({
        // 存储每个目标的主任务
        mainTasks: {}, // goalId -> mainTask
        
        // 添加或更新主任务
        setMainTask: (goalId, taskText) => {
          if (!goalId) return;
          
          console.log('设置主任务 in MainTaskStore:', { goalId, taskText });
          set((state) => ({
            mainTasks: {
              ...state.mainTasks,
              [goalId]: taskText
            }
          }));
        },
        
        // 获取目标的主任务
        getMainTask: (goalId) => {
          if (!goalId) return null;
          const state = get();
          return state.mainTasks[goalId] || null;
        },
        
        // 移除目标的主任务
        removeMainTask: (goalId) => {
          if (!goalId) return;
          
          set((state) => {
            const updatedTasks = { ...state.mainTasks };
            delete updatedTasks[goalId];
            return { mainTasks: updatedTasks };
          });
        },
        
        // 清除所有主任务
        clearAllMainTasks: () => set({ mainTasks: {} })
      }),
      {
        name: 'main-task-storage',
      }
    )
  )
);

export default useMainTaskStore; 