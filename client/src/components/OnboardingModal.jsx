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
      // 根据是临时用户还是注册用户设置不同的 userId
      const finalGoalData = {
        ...goalData,
        userId: userId,
      };

      // 创建新目标
      const response = await apiService.goals.createGoal(finalGoalData);

      if (response.data && response.data.success) {
        // 成功创建目标后通知父组件
        onComplete(response.data.data);
      } else {
        setError('创建目标时出错，请稍后重试。');
      }
    } catch (err) {
      console.error('创建目标时出错:', err);
      setError(err.message || '创建目标时出错，请稍后重试。');
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