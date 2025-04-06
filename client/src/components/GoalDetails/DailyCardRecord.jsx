import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import DailyTasks from './DailyTasks';
import DailyReward from './DailyReward';
import apiService from '../../services/api';

/**
 * DailyCardRecord component displays and manages a daily card with tasks, rewards, and progress records
 * @param {Object} props
 * @param {Object} props.goal - The goal object
 * @param {string} props.date - The date of the daily card in format YYYY-MM-DD
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Callback for when dialog is closed
 * @param {Function} props.onSave - Callback for when changes are saved
 * @param {Function} props.onViewDeclaration - Callback to view declaration
 */
export default function DailyCardRecord({ 
  goal, 
  date, 
  open, 
  onClose, 
  onSave,
  onViewDeclaration 
}) {
  // Format the date for display (e.g., "4/9 Wednesday")
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    
    return `${month}/${day} ${weekday}`;
  };

  // State for the daily card data
  const [cardData, setCardData] = useState({
    date: date,
    dailyTask: '',
    dailyReward: '',
    completed: {
      dailyTask: false,
      dailyReward: false
    },
    records: []
  });

  // State for new record input
  const [newRecord, setNewRecord] = useState('');
  
  // Loading and error states
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load daily card data when goal or date changes
  useEffect(() => {
    if (!goal || !date) return;
    
    // Find existing daily card for this date
    const existingCard = goal.dailyCards && goal.dailyCards.find(card => card.date === date);
    
    if (existingCard) {
      // Use existing card data
      setCardData(existingCard);
    } else {
      // Create new card with current goal settings
      setCardData({
        date: date,
        dailyTask: goal.currentSettings?.dailyTask || '',
        dailyReward: goal.currentSettings?.dailyReward || '',
        completed: {
          dailyTask: false,
          dailyReward: false
        },
        records: []
      });
    }
  }, [goal, date, open]);

  // Handle task completion status change
  const handleTaskStatusChange = (completed) => {
    setCardData(prev => ({
      ...prev,
      completed: {
        ...prev.completed,
        dailyTask: completed
      }
    }));
  };

  // Handle reward claimed status change
  const handleRewardStatusChange = (claimed) => {
    setCardData(prev => ({
      ...prev,
      completed: {
        ...prev.completed,
        dailyReward: claimed
      }
    }));
  };

  // Handle adding a new progress record
  const handleAddRecord = (e) => {
    if (e.key === 'Enter' && newRecord.trim()) {
      setCardData(prev => ({
        ...prev,
        records: [
          ...prev.records,
          {
            content: newRecord.trim(),
            createdAt: new Date().toISOString()
          }
        ]
      }));
      setNewRecord('');
    }
  };

  // Handle deleting a progress record
  const handleDeleteRecord = (index) => {
    setCardData(prev => ({
      ...prev,
      records: prev.records.filter((_, i) => i !== index)
    }));
  };

  // Handle saving changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      if (!goal || !goal._id) {
        throw new Error('Invalid goal data');
      }
      
      // Prepare data for saving
      const updatedCard = {
        ...cardData
      };
      
      // Save to API
      const goalId = goal._id || goal.id;
      const response = await apiService.goals.addOrUpdateDailyCard(goalId, updatedCard);
      
      // Show success message
      setSuccess('Daily progress saved successfully');
      
      // Clear success message after a few seconds
      setTimeout(() => setSuccess(''), 3000);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      console.error('Failed to save daily card:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Tasks for the DailyTasks component
  const tasksForComponent = cardData.dailyTask ? [{
    id: `daily-task-${date}`,
    text: cardData.dailyTask,
    completed: cardData.completed.dailyTask
  }] : [];

  const displayDate = formatDisplayDate(date);
  
  return (
    <Dialog
      open={open}
      onClose={() => !isSaving && onClose()}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <IconButton
          edge="start"
          onClick={onClose}
          disabled={isSaving}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
          {displayDate}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ mr: 1 }}>
            {goal?.title || 'Goal'}
          </Typography>
          
          <Tooltip title="View Declaration">
            <IconButton
              color="primary"
              onClick={onViewDeclaration}
              size="small"
            >
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {/* Daily Task Section */}
        <DailyTasks 
          tasks={tasksForComponent} 
          onTaskStatusChange={(taskId, completed) => handleTaskStatusChange(completed)}
        />
        
        {/* Daily Reward Section */}
        <DailyReward 
          reward={cardData.dailyReward}
          claimed={cardData.completed.dailyReward}
          onClaimedChange={handleRewardStatusChange}
          disabled={!cardData.completed.dailyTask} // Disable if task not completed
        />
        
        <Divider sx={{ my: 2 }} />
        
        {/* Progress Records Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Today's Progress:
          </Typography>
          
          {/* Existing Records */}
          {cardData.records && cardData.records.length > 0 ? (
            <Paper variant="outlined" sx={{ mb: 2, maxHeight: '200px', overflow: 'auto' }}>
              <List dense>
                {cardData.records.map((record, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={record.content}
                      secondary={new Date(record.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleDeleteRecord(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              No progress records yet. Add your first record below.
            </Typography>
          )}
          
          {/* New Record Input */}
          <Box sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter new record, press Enter to submit..."
              value={newRecord}
              onChange={(e) => setNewRecord(e.target.value)}
              onKeyPress={handleAddRecord}
              disabled={isSaving}
              helperText="Suggested format: Spent [time] [activity] — [insight/result]"
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={handleAddRecord}
              sx={{ ml: 1 }}
              disabled={!newRecord.trim() || isSaving}
            >
              {isSaving ? <CircularProgress size={20} /> : 'Add'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
