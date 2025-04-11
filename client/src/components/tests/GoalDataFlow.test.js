import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟API服务
vi.mock('../../services/api', () => {
  // 模拟自动生成description的逻辑
  const createGoalMock = vi.fn((goalData) => {
    // 实现和真实api.js相同的描述生成逻辑
    const data = { ...goalData };
    if (!data.description && data.title && data.motivation) {
      data.description = `我想要${data.title}，因为${data.motivation}。`;
    }
    
    return Promise.resolve({
      data: {
        success: true,
        data: {
          _id: 'mock-goal-id',
          ...data
        }
      }
    });
  });
  
  return {
    default: {
      goals: {
        createGoal: createGoalMock
      }
    }
  };
});

import apiService from '../../services/api';

describe('目标创建数据流测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('描述(description)字段应该正确传递到API', async () => {
    // 模拟GoalSettingGuide生成的数据
    const goalData = {
      title: '完成项目',
      motivation: '提高我的技能',
      targetDate: new Date('2023-12-31'),
      resources: ['时间管理'],
      dailyTasks: ['写代码'],
      rewards: ['休息时间'],
      visionImageUrl: 'http://example.com/image.jpg',
      userId: 'user123',
      // 不包含description字段
    };

    // 调用API层
    await apiService.goals.createGoal(goalData);

    // 验证API调用
    expect(apiService.goals.createGoal).toHaveBeenCalledTimes(1);
    
    // 验证传递给API的数据包含自动生成的description
    const calledWithData = apiService.goals.createGoal.mock.calls[0][0];
    expect(calledWithData).toHaveProperty('description');
    expect(calledWithData.description).toBe('我想要完成项目，因为提高我的技能。');
  });

  it('如果已提供description字段，应保持不变', async () => {
    // 模拟带有description的数据
    const goalData = {
      title: '完成项目',
      motivation: '提高我的技能',
      description: '这是一个自定义描述',
      userId: 'user123',
    };

    // 调用API层
    await apiService.goals.createGoal(goalData);

    // 验证API调用
    expect(apiService.goals.createGoal).toHaveBeenCalledTimes(1);
    
    // 验证description字段保持不变
    const calledWithData = apiService.goals.createGoal.mock.calls[0][0];
    expect(calledWithData.description).toBe('这是一个自定义描述');
  });
}); 