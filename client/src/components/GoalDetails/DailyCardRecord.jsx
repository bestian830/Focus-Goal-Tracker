import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
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
  Snackbar,
  InputAdornment,
  Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
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
    taskCompletions: {}, // 用于存储每个任务的独立完成状态
    records: []
  });

  // State for new record input
  const [newRecord, setNewRecord] = useState('');
  
  // Loading and error states
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // State for new task input and task editing
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [taskDeleteConfirmOpen, setTaskDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Handle viewing declaration details
  const handleViewDeclaration = () => {
    // Check if callback exists and call it with the goal object
    if (onViewDeclaration && goal) {
      console.log('Opening goal declaration dialog', goal);
      onClose(); // Close current dialog first
      onViewDeclaration(goal); // Then open declaration dialog
      return;
    }
    console.warn('Cannot open declaration dialog: onViewDeclaration callback not provided or goal is empty');
  };

  // Load daily card data when goal or date changes
  useEffect(() => {
    if (!goal || !date) return;
    
    // Find existing daily card for this date
    const existingCard = goal.dailyCards && goal.dailyCards.find(card => {
      // 比较日期（只比较年月日，不比较时分秒）
      const cardDate = new Date(card.date);
      const targetDate = new Date(date);
      return (
        cardDate.getFullYear() === targetDate.getFullYear() &&
        cardDate.getMonth() === targetDate.getMonth() &&
        cardDate.getDate() === targetDate.getDate()
      );
    });
    
    if (existingCard) {
      // 使用本地日期格式處理，而不是 UTC
      const today = new Date();
      const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // 解析卡片日期
      let cardDateObj = new Date(date);
      const cardDateFormatted = `${cardDateObj.getFullYear()}-${String(cardDateObj.getMonth() + 1).padStart(2, '0')}-${String(cardDateObj.getDate()).padStart(2, '0')}`;
      
      // 記錄日期比較信息
      console.log('Comparing card date with today:', {
        cardDate: cardDateFormatted,
        today: todayFormatted,
        isToday: cardDateFormatted === todayFormatted,
        isFuture: cardDateFormatted > todayFormatted
      });

      // 初始化任务完成状态
      const taskCompletions = existingCard.taskCompletions || {};
      
      // Check if the card is for today or a future date
      if (cardDateFormatted >= todayFormatted) {
        // For today or future dates, update with latest settings but preserve completion status
        setCardData({
          ...existingCard,
          dailyTask: goal.currentSettings?.dailyTask || existingCard.dailyTask || '',
          // Ensure records is an array
          records: Array.isArray(existingCard.records) ? existingCard.records : [],
          taskCompletions // 保留任务完成状态
        });
      } else {
        // For past dates, use existing card data unchanged, but ensure records is an array
        setCardData({
          ...existingCard,
          records: Array.isArray(existingCard.records) ? existingCard.records : [],
          taskCompletions // 保留任务完成状态
        });
      }
    } else {
      // 初始化任务完成状态为全部未完成
      const taskCompletions = {};
      if (goal && goal.dailyTasks && goal.dailyTasks.length > 0) {
        goal.dailyTasks.forEach((taskText) => {
          // 使用与任务列表生成相同的ID逻辑
          const taskId = `task-${taskText.replace(/\s+/g, '-').toLowerCase()}`;
          taskCompletions[taskId] = false;
        });
      }
      if (goal && goal.currentSettings?.dailyTask) {
        // 使用与任务列表生成相同的ID逻辑
        const taskId = `daily-task-${goal.currentSettings.dailyTask.replace(/\s+/g, '-').toLowerCase()}`;
        taskCompletions[taskId] = false;
      }
      
      // Create new card with current goal settings
      setCardData({
        date: date,
        dailyTask: goal.currentSettings?.dailyTask || '',
        completed: {
          dailyTask: false
        },
        taskCompletions, // 添加初始任务完成状态
        records: []  // Empty array for new cards
      });
    }
    
    // Log the state for debugging
    console.log('Daily card data initialized:', {
      date,
      existingCard: existingCard ? 'found' : 'not found',
      recordsType: existingCard ? (Array.isArray(existingCard.records) ? 'array' : typeof existingCard.records) : 'N/A'
    });
  }, [goal, date, open]);

  // Handle task completion status change
  const handleTaskStatusChange = (taskId, completed) => {
    console.log(`Task ${taskId} status changed to ${completed}`);
    
    setCardData(prev => {
      // 更新特定任务的完成状态
      const updatedTaskCompletions = {
        ...prev.taskCompletions,
        [taskId]: completed
      };
      
      // 检查是否有任何任务完成
      const anyTaskCompleted = Object.values(updatedTaskCompletions).some(status => status === true);
      
      return {
        ...prev,
        taskCompletions: updatedTaskCompletions,
        // 设置整体任务完成状态
        completed: {
          ...prev.completed,
          dailyTask: anyTaskCompleted
        }
      };
    });
  };

  // Handle adding a new progress record
  const handleAddRecord = (e) => {
    // For Enter key press
    if (e.key === 'Enter' && newRecord.trim()) {
      addNewRecord();
      return;
    }
    
    // For button click
    if (!e.key && newRecord.trim()) {
      addNewRecord();
    }
  };
  
  // Add new record helper function
  const addNewRecord = () => {
    if (!newRecord.trim()) return;
    
    setCardData(prev => {
      // Ensure records is an array
      const prevRecords = Array.isArray(prev.records) ? prev.records : [];
      
      return {
        ...prev,
        records: [
          ...prevRecords,
          {
            content: newRecord.trim(),
            createdAt: new Date().toISOString()
          }
        ]
      };
    });
    setNewRecord('');
  };

  // Handle initiating record deletion - opens confirmation dialog
  const handleInitiateDelete = (index) => {
    setRecordToDelete(index);
    setDeleteConfirmOpen(true);
  };
  
  // Handle canceling record deletion
  const handleCancelDelete = () => {
    setRecordToDelete(null);
    setDeleteConfirmOpen(false);
  };
  
  // Handle confirming record deletion
  const handleConfirmDelete = () => {
    if (recordToDelete !== null) {
      setCardData(prev => {
        // Ensure records is an array
        const prevRecords = Array.isArray(prev.records) ? prev.records : [];
        
        return {
          ...prev,
          records: prevRecords.filter((_, i) => i !== recordToDelete)
        };
      });
      
      // Close dialog and reset state
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
      
      // Show success message
      setSuccess('Record deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Handle adding a new daily task
  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    
    try {
      setIsSaving(true);
      
      // 使用与任务列表生成相同的ID逻辑
      const taskText = newTaskText.trim();
      const newTaskId = `task-${taskText.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Update goal's dailyTasks array
      const updatedDailyTasks = [...(goal.dailyTasks || []), taskText];
      
      // Update local state for task completions
      setCardData(prev => ({
        ...prev,
        taskCompletions: {
          ...prev.taskCompletions,
          [newTaskId]: false
        }
      }));
      
      // Call API to update the goal
      await apiService.goals.update(goal._id, {
        dailyTasks: updatedDailyTasks
      });
      
      // Update local goal data
      goal.dailyTasks = updatedDailyTasks;
      
      // Clear input field
      setNewTaskText('');
      
      // Show success message
      setSuccess('New daily task added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add daily task:', error);
      setError(`Failed to add daily task: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle initiating task edit
  const handleInitiateTaskEdit = (taskId, taskText) => {
    setEditingTaskId(taskId);
    setEditingTaskText(taskText);
  };
  
  // Handle canceling task edit
  const handleCancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };
  
  // Handle saving task edit
  const handleSaveTaskEdit = async (taskId, taskIndex) => {
    if (!editingTaskText.trim()) return;
    
    try {
      setIsSaving(true);
      
      // Update goal's dailyTasks array
      const updatedDailyTasks = [...goal.dailyTasks];
      updatedDailyTasks[taskIndex] = editingTaskText.trim();
      
      // Call API to update the goal
      await apiService.goals.update(goal._id, {
        dailyTasks: updatedDailyTasks
      });
      
      // Update local goal data
      goal.dailyTasks = updatedDailyTasks;
      
      // Reset editing state
      setEditingTaskId(null);
      setEditingTaskText('');
      
      // Show success message
      setSuccess('Daily task updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update daily task:', error);
      setError(`Failed to update daily task: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle initiating task deletion
  const handleInitiateTaskDelete = (taskId, taskIndex) => {
    setTaskToDelete({ id: taskId, index: taskIndex });
    setTaskDeleteConfirmOpen(true);
  };
  
  // Handle canceling task deletion
  const handleCancelTaskDelete = () => {
    setTaskToDelete(null);
    setTaskDeleteConfirmOpen(false);
  };
  
  // Handle confirming task deletion
  const handleConfirmTaskDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      setIsSaving(true);
      
      // Remove task from goal's dailyTasks array
      const updatedDailyTasks = [...goal.dailyTasks];
      updatedDailyTasks.splice(taskToDelete.index, 1);
      
      // Call API to update the goal
      await apiService.goals.update(goal._id, {
        dailyTasks: updatedDailyTasks
      });
      
      // Update local goal data
      goal.dailyTasks = updatedDailyTasks;
      
      // Close dialog and reset state
      setTaskDeleteConfirmOpen(false);
      setTaskToDelete(null);
      
      // Show success message
      setSuccess('Daily task deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to delete daily task:', error);
      setError(`Failed to delete daily task: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Tasks for the DailyTasks component
  const tasksForComponent = [];
  
  // 如果goal有dailyTasks数组，添加到任务列表
  if (goal && goal.dailyTasks && goal.dailyTasks.length > 0) {
    goal.dailyTasks.forEach((taskText, index) => {
      // 使用任务文本的哈希作为稳定的ID，而不是索引
      // 这样即使任务顺序改变，同一个任务的ID也会保持一致
      const taskId = `task-${taskText.replace(/\s+/g, '-').toLowerCase()}`;
      tasksForComponent.push({
        id: taskId,
        text: taskText,
        completed: cardData.taskCompletions[taskId] || false,
        index: index // 添加索引以便编辑和删除
      });
    });
  }
  
  // 如果cardData有dailyTask，也添加到列表（保持兼容）
  if (cardData.dailyTask && !tasksForComponent.some(task => task.text === cardData.dailyTask)) {
    const taskId = `daily-task-${cardData.dailyTask.replace(/\s+/g, '-').toLowerCase()}`;
    tasksForComponent.push({
      id: taskId,
      text: cardData.dailyTask,
      completed: cardData.taskCompletions[taskId] || false,
      isLegacy: true // 标记为旧格式的任务
    });
  }

  const displayDate = formatDisplayDate(date);
  
  // Handle saving changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      if (!goal || !goal._id) {
        console.error('Invalid goal data for save:', goal);
        throw new Error('Invalid goal data');
      }
      
      // 確保日期格式正確，使用本地時間處理
      let cardDate;
      try {
        cardDate = date ? new Date(date) : new Date();
        
        if (isNaN(cardDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (error) {
        console.error('Error creating date object:', error, date);
        setError('Invalid date format. Please try again.');
        setIsSaving(false);
        return;
      }
      
      // 準備發送給API的數據 - 使用 ISO 格式，但保留本地日期
      const updatedCard = {
        ...cardData,
        // 創建基於本地日期的 ISO 字符串 (UTC 午夜)
        date: new Date(
          cardDate.getFullYear(), 
          cardDate.getMonth(), 
          cardDate.getDate()
        ).toISOString(),
        taskCompletions: cardData.taskCompletions // 确保包含任务完成状态
      };
      
      console.log('Sending updated card to API:', updatedCard);
      console.log('Task completions being saved:', cardData.taskCompletions);
      
      // Save to API
      const goalId = goal._id || goal.id;
      console.log('Using goal ID for save:', goalId);
      
      const response = await apiService.goals.addOrUpdateDailyCard(goalId, updatedCard);
      console.log('API response:', response);
      
      // Show success message with completed tasks info
      const completedTasksCount = Object.values(cardData.taskCompletions).filter(Boolean).length;
      const totalTasksCount = Object.keys(cardData.taskCompletions).length;
      
      setSuccess(`Daily progress saved successfully (${completedTasksCount}/${totalTasksCount} tasks completed)`);
      
      // Clear success message after a few seconds
      setTimeout(() => setSuccess(''), 5000);
      
      // Call onSave callback if provided
      if (onSave) {
        console.log('Calling onSave callback with response data');
        onSave(response.data);
      } else {
        console.log('No onSave callback provided');
      }
    } catch (error) {
      console.error('Failed to save daily card:', error);
      setError(`Failed to save changes: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

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
          <Typography variant="body1" component="span" sx={{ color: 'text.secondary', mr: 1 }}>
            Goal:
          </Typography>
          <Typography variant="h6" component="div" sx={{ mr: 1 }}>
            {goal?.title || 'Goal'}
          </Typography>
          
          <Tooltip title="View and edit goal declaration">
            <IconButton
              color="primary"
              onClick={handleViewDeclaration}
              size="small"
            >
              <MenuBookIcon />
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
        
        {/* Daily Tasks Section */}
        <Box sx={{ my: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Daily Tasks</span>
          </Typography>
          
          {/* Task List */}
          {tasksForComponent.length > 0 ? (
            <List>
              {tasksForComponent.map((task) => (
                <ListItem key={task.id} sx={{ p: 0, my: 1 }}>
                  {editingTaskId === task.id ? (
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        size="small"
                        autoFocus
                      />
                      <IconButton 
                        color="primary" 
                        onClick={() => handleSaveTaskEdit(task.id, task.index)}
                        disabled={isSaving}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton 
                        color="default" 
                        onClick={handleCancelTaskEdit}
                        disabled={isSaving}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Checkbox
                          checked={task.completed}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.checked)}
                          color="primary"
                        />
                        <Typography 
                          sx={{ 
                            flex: 1,
                            color: task.completed ? 'success.main' : 'text.primary',
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}
                        >
                          {task.text}
                        </Typography>
                        {!task.isLegacy && (
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={() => handleInitiateTaskEdit(task.id, task.text)}
                              disabled={isSaving}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleInitiateTaskDelete(task.id, task.index)}
                              disabled={isSaving}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
              No daily tasks set for this goal.
            </Typography>
          )}
          
          {/* Add New Task Input */}
          <Box sx={{ display: 'flex', mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a new daily task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              disabled={isSaving}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      color="primary"
                      onClick={handleAddTask}
                      disabled={!newTaskText.trim() || isSaving}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Progress Records Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Today's Progress:
          </Typography>
          
          {/* Existing Records */}
          {Array.isArray(cardData.records) && cardData.records.length > 0 ? (
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
                      <IconButton edge="end" onClick={() => handleInitiateDelete(index)}>
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
              onKeyDown={(e) => e.key === 'Enter' && handleAddRecord(e)}
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
      
      {/* Delete Task Confirmation Dialog */}
      <Dialog
        open={taskDeleteConfirmOpen}
        onClose={handleCancelTaskDelete}
        aria-labelledby="delete-task-dialog-title"
      >
        <DialogTitle id="delete-task-dialog-title">
          Delete Daily Task
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this daily task? 
            <br />
            It will be removed permanently.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelTaskDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmTaskDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Progress Record
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this progress record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
