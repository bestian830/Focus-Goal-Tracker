import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material';
import apiService from '../../services/api';
import '../../styles/AIFeedback.css';

export default function AIFeedback({ goalId }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const generateFeedback = async () => {
    // 如果没有goalId，直接返回
    if (!goalId) {
      setError('没有选择目标，无法生成分析');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('开始请求生成报告，goalId:', goalId);
      const response = await apiService.reports.generate(goalId);
      console.log('收到报告响应:', response);
      
      if (response.data && response.data.success) {
        console.log('报告数据:', response.data.data);
        setFeedback(response.data.data);
        setLastUpdate(new Date());
      } else {
        console.log('生成报告失败，响应:', response);
        setError('生成分析失败，请稍后重试');
      }
    } catch (err) {
      console.error('生成分析错误:', err);
      console.error('错误详情:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      setError(err.response?.data?.error || '生成分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} className="ai-feedback-paper">
      <Box className="ai-feedback-header">
        <Typography variant="h6">AI 进度分析</Typography>
        <Button 
          variant="contained" 
          onClick={generateFeedback}
          disabled={loading || !goalId}
        >
          {loading ? '分析中...' : '生成分析'}
        </Button>
      </Box>

      {error && (
        <Typography color="error" gutterBottom>
          {typeof error === 'string' ? error : error.message || '发生未知错误'}
        </Typography>
      )}

      {loading && (
        <Box className="ai-feedback-loading-container">
          <CircularProgress />
          <Typography variant="body2" className="ai-feedback-loading-text">
            正在生成分析...
          </Typography>
        </Box>
      )}

      {!feedback && !loading && !error && (
        <Box className="ai-feedback-placeholder">
          <Typography variant="body2" color="text.secondary">
            {goalId ? '点击按钮生成 AI 分析报告' : '请先选择一个目标'}
          </Typography>
        </Box>
      )}

      {feedback && (
        <>
          <Box className="ai-feedback-content">
            {feedback.content || '暂无分析内容'}
          </Box>
          <Box className="ai-feedback-timestamp">
            <Typography variant="subtitle2" color="text.secondary">
              分析时间: {lastUpdate?.toLocaleString()}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}
