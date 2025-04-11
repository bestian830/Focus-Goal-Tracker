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
  
  // Add time range selection state
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

  // Handle time range change
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

  // Close custom date dialog
  const handleCloseCustomDate = () => {
    setCustomDateOpen(false);
  };

  // Confirm custom date range
  const handleConfirmCustomDate = () => {
    setCustomDateOpen(false);
  };

  const generateFeedback = async () => {
    // If no goalId, return directly
    if (!goalId) {
      setError('No goal selected, cannot generate analysis');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Starting to request report generation, goalId:', goalId);
      console.log('Time range:', timeRange, 'Start date:', startDate, 'End date:', endDate);
      
      // Convert dates to ISO string format
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();
      
      const response = await apiService.reports.generate(goalId, startDateStr, endDateStr);
      console.log('Received report response:', response);
      
      if (response.data && response.data.success) {
        console.log('Report data:', response.data.data);
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
        console.log('Failed to generate report, response:', response);
        setError('Failed to generate analysis, please try again later');
      }
    } catch (err) {
      console.error('Error generating analysis:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      setError(err.response?.data?.error || 'Failed to generate analysis, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} className="ai-feedback-paper">
      <Box className="ai-feedback-header">
        <Typography variant="h6" className="ai-feedback-title">AI Progress Analysis</Typography>
        
        <Box className="ai-feedback-controls">
          <FormControl variant="outlined" size="small" className="ai-feedback-date-range">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
              disabled={loading}
            >
              <MenuItem value="last7days">Last 7 Days</MenuItem>
              <MenuItem value="last30days">Last 30 Days</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            onClick={generateFeedback}
            disabled={loading || !goalId}
            className="ai-feedback-generate-btn"
          >
            {loading ? 'Analyzing...' : (feedback ? 'Regenerate' : 'Generate Analysis')}
          </Button>
        </Box>
      </Box>

      {/* Custom date range dialog */}
      <Dialog open={customDateOpen} onClose={handleCloseCustomDate}>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box className="ai-feedback-date-picker-container">
              <DatePicker
                label="Start Date"
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
                label="End Date"
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
          <Button onClick={handleCloseCustomDate}>Cancel</Button>
          <Button onClick={handleConfirmCustomDate} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Typography color="error" gutterBottom>
          {typeof error === 'string' ? error : error.message || 'An unknown error occurred'}
        </Typography>
      )}

      {loading && (
        <Box className="ai-feedback-loading-container">
          <CircularProgress />
          <Typography variant="body2" className="ai-feedback-loading-text">
            Generating analysis...
          </Typography>
        </Box>
      )}

      {!feedback && !loading && !error && (
        <Box className="ai-feedback-placeholder">
          <Typography variant="body2" color="text.secondary">
            {goalId ? 'Click the button to generate AI analysis report' : 'Please select a goal first'}
          </Typography>
        </Box>
      )}

      {feedback && (
        <>
          <Box className="ai-feedback-content" data-export-id="ai-analysis-content">
            {feedback.content || 'No analysis content available'}
          </Box>
          <Box className="ai-feedback-timestamp">
            <Typography variant="subtitle2" color="text.secondary">
              Analysis time: {lastUpdate?.toLocaleString()}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" className="ai-feedback-date-range-info">
              Analysis range: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}
