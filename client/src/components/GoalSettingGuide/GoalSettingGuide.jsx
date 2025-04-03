import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, Paper, Container } from '@mui/material';
import TitleStep from './TitleStep';
import MotivationStep from './MotivationStep';
import ResourcesStep from './ResourcesStep';
import VisionStep from './VisionStep';
import RewardsStep from './RewardsStep';

// 步骤标题
const steps = [
  '目标设定',
  '动机探索',
  '资源与步骤',
  '愿景设定',
  '奖励机制'
];

/**
 * 目标设置引导组件
 * 引导用户通过 5 个步骤完成目标设置
 */
const GoalSettingGuide = ({ onComplete }) => {
  // 当前步骤
  const [activeStep, setActiveStep] = useState(0);
  
  // 目标数据
  const [goalData, setGoalData] = useState({
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
    targetDate: null
  });

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
        // 添加调试日志，查看当前值
        console.log("验证第五步：", {
          dailyReward: goalData.details.dailyReward,
          ultimateReward: goalData.details.ultimateReward,
          targetDate: goalData.targetDate
        });
        
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
    if (field.includes('.')) {
      const [section, key] = field.split('.');
      setGoalData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }));
    } else {
      setGoalData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // 当更新与第五步相关的字段时，添加日志
    if (field === 'details.dailyReward' || field === 'details.ultimateReward' || field === 'targetDate') {
      console.log(`更新字段 ${field}:`, value);
    }
  };

  // 下一步
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // 生成详细描述（可以根据累积的信息自动生成）
      const generatedDescription = `我想要${goalData.title}，因为${goalData.details.motivation}。`;
      
      // 更新最终数据
      const finalData = {
        ...goalData,
        description: generatedDescription,
        currentSettings: {
          ...goalData.currentSettings,
          dailyReward: goalData.details.dailyReward
        }
      };
      
      // 提交表单
      onComplete(finalData);
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  // 上一步
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
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
        <Typography variant="h4" align="center" gutterBottom>
          宣言制定指引
        </Typography>
        
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
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            上一步
          </Button>
          
          <Button
            variant="contained"
            disabled={!validateStep()}
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? '完成' : '下一步'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default GoalSettingGuide; 