import React, { useState } from 'react';
import { Box, TextField, Typography, Grid, Button, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * 资源与步骤设置
 * 第三步：用户确认自己有哪些资源和每日任务（都是可选的，可以添加多个）
 */
const ResourcesStep = ({ 
  resources, 
  dailyTasks,
  onAddResource,
  onRemoveResource,
  onAddDailyTask,
  onRemoveDailyTask
}) => {
  const [newResource, setNewResource] = useState('');
  const [newDailyTask, setNewDailyTask] = useState('');

  // 添加资源
  const handleAddResource = () => {
    if (newResource.trim()) {
      onAddResource(newResource);
      setNewResource('');
    }
  };

  // 添加每日任务
  const handleAddDailyTask = () => {
    if (newDailyTask.trim()) {
      onAddDailyTask(newDailyTask);
      setNewDailyTask('');
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            这个目标是可行的，因为我有（能力或资源）
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            列出你已经拥有的能帮助你达成目标的能力、资源或优势（可选）。
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              label="添加资源"
              variant="outlined"
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              placeholder="例如：我已经掌握了基础知识，有固定的学习时间..."
              inputProps={{ maxLength: 200 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddResource}
              sx={{ ml: 1 }}
              startIcon={<AddIcon />}
            >
              添加
            </Button>
          </Box>
          
          {resources.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                已添加的资源 ({resources.length})
              </Typography>
              <List dense>
                {resources.map((resource, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => onRemoveResource(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={resource} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            我可以每天跟踪的关于这个目标的事项
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            设定可执行的小任务，持续的小进步将累积成显著的成果（可选）。
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              label="添加每日任务"
              variant="outlined"
              value={newDailyTask}
              onChange={(e) => setNewDailyTask(e.target.value)}
              placeholder="例如：阅读20页专业书籍、跑步30分钟..."
              inputProps={{ maxLength: 200 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddDailyTask}
              sx={{ ml: 1 }}
              startIcon={<AddIcon />}
            >
              添加
            </Button>
          </Box>
          
          {dailyTasks.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                已添加的每日任务 ({dailyTasks.length})
              </Typography>
              <List dense>
                {dailyTasks.map((task, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => onRemoveDailyTask(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={task} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResourcesStep; 