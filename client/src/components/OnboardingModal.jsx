import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GoalSettingGuide from './GoalSettingGuide/GoalSettingGuide';
import apiService from '../services/api';

/**
 * 用户引导模态框
 * 在新用户首次登录或临时用户首次访问时显示目标设置引导
 */
const OnboardingModal = ({ open, onClose, userId, isGuest, onComplete }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 处理目标设置完成
  const handleGoalSubmit = async (goalData) => {
    setSubmitting(true);
    setError('');

    try {
      // 记录当前用户信息
      console.log("OnboardingModal - 处理目标提交", { userId, isGuest });

      // 检查临时用户ID
      if (isGuest) {
        // 从localStorage再次获取，确保最新
        const tempIdFromStorage = localStorage.getItem("tempId");
        console.log("从localStorage获取的临时用户ID:", tempIdFromStorage);
        
        // 如果传入的userId与localStorage中的不一致，使用localStorage中的
        if (tempIdFromStorage && tempIdFromStorage.startsWith('temp_') && 
            (!userId || userId !== tempIdFromStorage)) {
          console.log(`使用localStorage中的tempId替代传入的userId: ${tempIdFromStorage} 替代 ${userId}`);
          userId = tempIdFromStorage;
        }
      }

      // 根据是临时用户还是注册用户设置不同的 userId
      const finalGoalData = {
        ...goalData,
        userId: userId,
      };

      console.log("准备提交的目标数据:", finalGoalData);

      // 创建新目标
      let response;
      if (isGuest && userId && userId.toString().startsWith('temp_')) {
        console.log("检测到临时用户，尝试使用tempUsers API...");
        try {
          // 尝试使用临时用户的专用API
          response = await apiService.goals.createGoal(finalGoalData);
          console.log("临时用户目标创建响应:", response);
        } catch (tempError) {
          console.error("临时用户API调用失败:", tempError);
          throw tempError;
        }
      } else {
        // 常规注册用户
        response = await apiService.goals.createGoal(finalGoalData);
      }

      if (response.data && response.data.success) {
        console.log("目标创建成功:", response.data);
        // 成功创建目标后通知父组件
        onComplete(response.data.data);
      } else {
        console.error("API返回成功但响应不符合预期:", response);
        setError('创建目标时出错，API响应格式不正确。');
      }
    } catch (err) {
      console.error('创建目标时出错:', err);
      
      // 提供更详细的错误信息
      let errorMessage = '创建目标时出错，请稍后重试。';
      if (err.response) {
        console.error('错误响应:', err.response.data);
        errorMessage = err.response.data?.error?.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="onboarding-dialog-title"
    >
      <DialogTitle id="onboarding-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div">
            {isGuest ? '欢迎使用 Focus' : '开始制定你的第一个目标'}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <GoalSettingGuide 
          onComplete={handleGoalSubmit} 
          isSubmitting={submitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal; 