import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiService from '../../services/api';
import { useReportStore } from '../../store/reportStore';
import '../../styles/AIFeedback.css';

export default function AIFeedback({ goalId }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // 新增時間範圍選擇狀態
  const [timeRange, setTimeRange] = useState('last7days');
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  // Use Zustand store
  const { reports, setReport } = useReportStore();

  // Effect to load report from store when goalId changes
  useEffect(() => {
    if (!goalId) {
      // Reset states if no goalId
      setFeedback(null);
      setLastUpdate(null);
      return;
    }

    // Check if we have a cached report for this goal
    const cachedReport = reports[goalId];
    if (cachedReport) {
      console.log('Using cached report for goal:', goalId);
      setFeedback(cachedReport);
      // Parse the ISO string dates
      setLastUpdate(new Date(cachedReport.generatedAt));
      
      // Set date range from cached data if available
      if (cachedReport.dateRange) {
        setStartDate(new Date(cachedReport.dateRange.startDate));
        setEndDate(new Date(cachedReport.dateRange.endDate));
        
        // Determine time range based on dates
        const daysDiff = Math.round((new Date(cachedReport.dateRange.endDate) - new Date(cachedReport.dateRange.startDate)) / (24 * 60 * 60 * 1000));
        if (daysDiff === 7) {
          setTimeRange('last7days');
        } else if (daysDiff === 30) {
          setTimeRange('last30days');
        } else {
          setTimeRange('custom');
        }
      }
    } else {
      // No cached report, reset states
      setFeedback(null);
      setLastUpdate(null);
    }
  }, [goalId, reports]);

  // 處理時間範圍變更
  const handleTimeRangeChange = (event) => {
    const value = event.target.value;
    setTimeRange(value);
    
    if (value === 'custom') {
      setCustomDateOpen(true);
    } else if (value === 'last7days') {
      setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      setEndDate(new Date());
    } else if (value === 'last30days') {
      setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      setEndDate(new Date());
    }
  };

  // 關閉自定義日期對話框
  const handleCloseCustomDate = () => {
    setCustomDateOpen(false);
  };

  // 確認自定義日期範圍
  const handleConfirmCustomDate = () => {
    setCustomDateOpen(false);
  };

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
      console.log('时间范围:', timeRange, '开始日期:', startDate, '结束日期:', endDate);
      
      // 將日期轉換為ISO字符串格式
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      const response = await apiService.reports.generate(goalId, startDateStr, endDateStr);
      console.log('收到报告响应:', response);
      
      if (response.data && response.data.success) {
        console.log('报告数据:', response.data.data);
        const reportData = {
          ...response.data.data,
          startDate: startDateStr,
          endDate: endDateStr
        };
        
        setFeedback(reportData);
        setLastUpdate(new Date());
        
        // Save to Zustand store
        setReport(goalId, reportData);
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
        <Typography variant="h6" className="ai-feedback-title">AI 进度分析</Typography>
        
        <Box className="ai-feedback-controls">
          <FormControl variant="outlined" size="small" className="ai-feedback-date-range">
            <InputLabel>时间范围</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="时间范围"
              disabled={loading}
            >
              <MenuItem value="last7days">过去7天</MenuItem>
              <MenuItem value="last30days">过去30天</MenuItem>
              <MenuItem value="custom">自定义范围</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            onClick={generateFeedback}
            disabled={loading || !goalId}
            className="ai-feedback-generate-btn"
          >
            {loading ? '分析中...' : (feedback ? '重新生成' : '生成分析')}
          </Button>
        </Box>
      </Box>

      {/* 自定義日期範圍對話框 */}
      <Dialog open={customDateOpen} onClose={handleCloseCustomDate}>
        <DialogTitle>选择日期范围</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box className="ai-feedback-date-picker-container">
              <DatePicker
                label="开始日期"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    margin: "normal"
                  } 
                }}
                maxDate={endDate}
              />
              <DatePicker
                label="结束日期"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    margin: "normal"
                  } 
                }}
                minDate={startDate}
                maxDate={new Date()}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCustomDate}>取消</Button>
          <Button onClick={handleConfirmCustomDate} variant="contained">确认</Button>
        </DialogActions>
      </Dialog>

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
            <Typography variant="subtitle2" color="text.secondary" className="ai-feedback-date-range-info">
              分析范围: {startDate.toLocaleDateString()} 至 {endDate.toLocaleDateString()}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}
