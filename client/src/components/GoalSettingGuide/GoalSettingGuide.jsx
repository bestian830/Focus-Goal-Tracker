import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, Paper, Container, CircularProgress } from '@mui/material';
import TitleStep from './TitleStep';
import MotivationStep from './MotivationStep';
import DateStep from './DateStep';
import ResourcesStep from './ResourcesStep';
import RewardsStep from './RewardsStep';
import VisionStep from './VisionStep';

// localStorage 键名
const STORAGE_KEY = 'focus_goal_setting_draft';

// 步骤标题
const steps = [
  '目标设定',
  '动机探索',
  '日期设定',
  '资源与步骤',
  '奖励机制',
  '願景圖片'
];

// 初始表单数据
const initialGoalData = {
  title: '',
  motivation: '',
  targetDate: null,
  resources: [], // 改为数组，可添加多个
  dailyTasks: [], // 改为数组，可添加多个
  rewards: [], // 改为数组，可添加多个
  visionImageUrl: null,
  status: 'active' // 默认状态
};

/**
 * 目标设置引导组件
 * 引导用户通过 5 个步骤完成目标设置
 */
const GoalSettingGuide = ({ onComplete, isSubmitting = false, onCancel }) => {
  // 当前步骤
  const [activeStep, setActiveStep] = useState(0);
  
  // 目标数据
  const [goalData, setGoalData] = useState(initialGoalData);

  // 从 localStorage 加载已保存的数据
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // 如果有日期字段，需要转换为 Date 对象
        if (parsedData.targetDate) {
          parsedData.targetDate = new Date(parsedData.targetDate);
        }
        setGoalData(parsedData);
        console.log('已从 localStorage 恢复表单数据');
      }
    } catch (error) {
      console.error('从 localStorage 恢复数据失败:', error);
    }
  }, []);

  // 验证当前步骤是否可以继续
  const validateStep = () => {
    switch (activeStep) {
      case 0: // 标题步骤
        return goalData.title.trim() !== '';
      case 1: // 动机步骤
        return goalData.motivation.trim() !== '';
      case 2: // 日期步骤
        return goalData.targetDate !== null && goalData.targetDate instanceof Date;
      case 3: // 资源步骤
        // resources和dailyTasks是可选的
        return true;
      case 4: // 奖励步骤
        // rewards是可选的
        return true;
      case 5: // 願景圖片步骤
        // 願景圖片是可選的
        return true;
      default:
        return false;
    }
  };

  // 处理数据更新
  const handleDataChange = (field, value) => {
    const updatedData = {
      ...goalData,
      [field]: value
    };
    
    setGoalData(updatedData);
    
    // 保存到 localStorage
    try {
      const dataToSave = {...updatedData};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('保存数据到 localStorage 失败:', error);
    }
  };

  // 添加多项元素（资源/任务/奖励）
  const handleAddItem = (field, item) => {
    if (!item.trim()) return;
    
    const items = [...goalData[field], item];
    handleDataChange(field, items);
  };

  // 删除多项元素
  const handleRemoveItem = (field, index) => {
    const items = [...goalData[field]];
    items.splice(index, 1);
    handleDataChange(field, items);
  };

  // 下一步
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      console.log("GoalSettingGuide: Final step, preparing to submit...");
      
      // 生成详细描述
      const generatedDescription = `我想要${goalData.title}，因为${goalData.motivation}。`;
      
      // 確保所有必要的字段都有值
      const finalGoalData = {
        ...goalData,
        description: generatedDescription,
      };
      
      console.log("GoalSettingGuide: 目标设置最终数据:", {
        title: finalGoalData.title,
        hasMotivation: !!finalGoalData.motivation,
        targetDate: finalGoalData.targetDate,
        resourcesCount: finalGoalData.resources.length,
        dailyTasksCount: finalGoalData.dailyTasks.length,
        rewardsCount: finalGoalData.rewards.length,
        hasVisionImage: !!finalGoalData.visionImageUrl
      });
      
      try {
        // 提交表单
        console.log("GoalSettingGuide: 调用 onComplete 提交表单...");
        onComplete(finalGoalData);
        
        // 清除 localStorage 中的数据
        console.log("GoalSettingGuide: 清除本地存储的表单数据");
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("GoalSettingGuide: 提交表单时出错:", error);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  // 上一步
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // 处理取消
  const handleCancel = () => {
    // 清除 localStorage 中的数据
    localStorage.removeItem(STORAGE_KEY);
    
    // 调用外部取消处理函数（如果有）
    if (onCancel) {
      onCancel();
    }
  };

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <TitleStep 
            value={goalData.title} 
            onChange={(value) => handleDataChange('title', value)} 
          />
        );
      case 1:
        return (
          <MotivationStep 
            value={goalData.motivation} 
            onChange={(value) => handleDataChange('motivation', value)} 
          />
        );
      case 2:
        return (
          <DateStep 
            value={goalData.targetDate} 
            onChange={(value) => handleDataChange('targetDate', value)} 
          />
        );
      case 3:
        return (
          <ResourcesStep 
            resources={goalData.resources}
            dailyTasks={goalData.dailyTasks}
            onAddResource={(value) => handleAddItem('resources', value)}
            onRemoveResource={(index) => handleRemoveItem('resources', index)}
            onAddDailyTask={(value) => handleAddItem('dailyTasks', value)}
            onRemoveDailyTask={(index) => handleRemoveItem('dailyTasks', index)}
          />
        );
      case 4:
        return (
          <RewardsStep 
            rewards={goalData.rewards}
            onAddReward={(value) => handleAddItem('rewards', value)}
            onRemoveReward={(index) => handleRemoveItem('rewards', index)}
          />
        );
      case 5:
        return (
          <VisionStep 
            value={goalData.visionImageUrl} 
            onChange={(value) => handleDataChange('visionImageUrl', value)} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" align="center" sx={{ flexGrow: 1 }}>
            宣言制定指引
          </Typography>
          <Button onClick={handleCancel} color="inherit" size="small">
            取消
          </Button>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent()}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
          >
            上一步
          </Button>
          
          <Button
            variant="contained"
            disabled={!validateStep() || isSubmitting}
            onClick={handleNext}
            startIcon={isSubmitting && activeStep === steps.length - 1 ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {activeStep === steps.length - 1 ? '完成' : '下一步'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default GoalSettingGuide; 