import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, Paper, Container, CircularProgress } from '@mui/material';
import TitleStep from './TitleStep';
import MotivationStep from './MotivationStep';
import ResourcesStep from './ResourcesStep';
import VisionStep from './VisionStep';
import RewardsStep from './RewardsStep';

// localStorage 键名
const STORAGE_KEY = 'focus_goal_setting_draft';

// 步骤标题
const steps = [
  '目标设定',
  '动机探索',
  '资源与步骤',
  '愿景设定',
  '奖励机制'
];

// 初始表单数据
const initialGoalData = {
  title: '',
  details: {
    motivation: '',
    resources: '',
    nextStep: '',
    visionImage: '',
    dailyReward: '',
    ultimateReward: ''
  },
  currentSettings: {
    dailyTask: '',
    dailyReward: ''
  },
  description: '',
  targetDate: null,
  priority: 'Medium', // 默认优先级
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
        return goalData.details.motivation.trim() !== '';
      case 2: // 资源步骤
        return (
          goalData.details.resources.trim() !== '' && 
          goalData.details.nextStep.trim() !== '' && 
          goalData.currentSettings.dailyTask.trim() !== ''
        );
      case 3: // 愿景步骤
        // 第4步：图片是可选的，所以总是返回true
        // 用户可以选择上传图片或跳过此步骤
        return true;
      case 4: // 奖励步骤
        return (
          goalData.details.dailyReward.trim() !== '' && 
          goalData.details.ultimateReward.trim() !== '' && 
          goalData.targetDate !== null
        );
      default:
        return false;
    }
  };

  // 处理数据更新
  const handleDataChange = (field, value) => {
    let updatedData;
    
    if (field.includes('.')) {
      const [section, key] = field.split('.');
      updatedData = {
        ...goalData,
        [section]: {
          ...goalData[section],
          [key]: value
        }
      };
    } else {
      updatedData = {
        ...goalData,
        [field]: value
      };
    }
    
    setGoalData(updatedData);
    
    // 保存到 localStorage
    try {
      const dataToSave = {...updatedData};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('保存数据到 localStorage 失败:', error);
    }
  };

  // 下一步
  const handleNext = () => {
    // 从愿景页面进入奖励页面时，如果没有选择图片，将visionImage设为null
    if (activeStep === 3) {
      if (!goalData.details.visionImage) {
        handleDataChange('details.visionImage', null);
      }
    }

    if (activeStep === steps.length - 1) {
      // 生成详细描述（可以根据累积的信息自动生成）
      const generatedDescription = `我想要${goalData.title}，因为${goalData.details.motivation}。`;
      
      // 验证 targetDate 字段是否有效
      if (!goalData.targetDate || !(goalData.targetDate instanceof Date) || isNaN(goalData.targetDate.getTime())) {
        console.error("目标日期无效:", goalData.targetDate);
        // 如果日期无效，设置为一周后
        goalData.targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        console.log("已设置默认目标日期:", goalData.targetDate);
      } else {
        console.log("目标日期有效:", goalData.targetDate);
      }
      
      // 更新最终数据
      const finalData = {
        ...goalData,
        description: generatedDescription,
        currentSettings: {
          ...goalData.currentSettings,
          dailyReward: goalData.details.dailyReward
        }
      };
      
      console.log("目标设置最终数据:", {
        title: finalData.title,
        targetDate: finalData.targetDate,
        hasMotivation: !!finalData.details.motivation,
        hasResources: !!finalData.details.resources,
        hasImage: !!finalData.details.visionImage,
        hasDailyTask: !!finalData.currentSettings.dailyTask
      });
      
      // 提交表单
      onComplete(finalData);
      
      // 清除 localStorage 中的数据
      localStorage.removeItem(STORAGE_KEY);
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
            value={goalData.details.motivation} 
            onChange={(value) => handleDataChange('details.motivation', value)} 
          />
        );
      case 2:
        return (
          <ResourcesStep 
            resources={goalData.details.resources}
            nextStep={goalData.details.nextStep}
            dailyTask={goalData.currentSettings.dailyTask}
            onResourcesChange={(value) => handleDataChange('details.resources', value)}
            onNextStepChange={(value) => handleDataChange('details.nextStep', value)}
            onDailyTaskChange={(value) => handleDataChange('currentSettings.dailyTask', value)}
          />
        );
      case 3:
        return (
          <VisionStep 
            value={goalData.details.visionImage} 
            onChange={(value) => handleDataChange('details.visionImage', value)} 
          />
        );
      case 4:
        return (
          <RewardsStep 
            dailyReward={goalData.details.dailyReward}
            ultimateReward={goalData.details.ultimateReward}
            targetDate={goalData.targetDate}
            onDailyRewardChange={(value) => handleDataChange('details.dailyReward', value)}
            onUltimateRewardChange={(value) => handleDataChange('details.ultimateReward', value)}
            onTargetDateChange={(value) => handleDataChange('targetDate', value)}
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