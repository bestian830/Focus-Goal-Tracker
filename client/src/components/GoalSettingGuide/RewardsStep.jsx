import React, { useState } from 'react';
import { Box, TextField, Typography, Grid, Button, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * 奖励设定步骤
 * 第四步：用户可以设置多个奖励项目（可选）
 */
const RewardsStep = ({ 
  rewards,
  onAddReward,
  onRemoveReward
}) => {
  const [newReward, setNewReward] = useState('');

  // 添加奖励
  const handleAddReward = () => {
    if (newReward.trim()) {
      onAddReward(newReward);
      setNewReward('');
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            我的奖励机制
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            为你的进步和成就设定奖励，这将帮助你保持动力和积极性（可选）。
          </Typography>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              label="添加奖励"
              variant="outlined"
              value={newReward}
              onChange={(e) => setNewReward(e.target.value)}
              placeholder="例如：完成一周任务后看一部电影，达成目标后去旅行..."
              inputProps={{ maxLength: 200 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddReward}
              sx={{ ml: 1 }}
              startIcon={<AddIcon />}
            >
              添加
            </Button>
          </Box>
          
          {rewards.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                已添加的奖励 ({rewards.length})
              </Typography>
              <List dense>
                {rewards.map((reward, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => onRemoveReward(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={reward} />
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

export default RewardsStep; 