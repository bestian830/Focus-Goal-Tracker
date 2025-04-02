import React from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';

/**
 * 奖励设定步骤
 * 第五步：用户设置完成每日任务的奖励、实现最终目标的奖励，以及目标日期
 */
const RewardsStep = ({ 
  dailyReward, 
  ultimateReward, 
  targetDate, 
  onDailyRewardChange, 
  onUltimateRewardChange, 
  onTargetDateChange 
}) => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            如果我完成每日任务，我会奖励自己
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            为每天的进步设定一个小奖励，这将帮助你建立积极的习惯循环。
          </Typography>
          
          <TextField
            fullWidth
            label="每日奖励"
            variant="outlined"
            value={dailyReward}
            onChange={(e) => onDailyRewardChange(e.target.value)}
            placeholder="例如：看30分钟喜欢的剧集、喝一杯优质咖啡..."
            inputProps={{ maxLength: 200 }}
            helperText={`${dailyReward.length}/200 字符`}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            如果我实现了这个目标，我会给自己的奖励是
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            为实现最终目标设定一个有意义的奖励，这将成为你路途中的强大动力。
          </Typography>
          
          <TextField
            fullWidth
            label="最终奖励"
            variant="outlined"
            value={ultimateReward}
            onChange={(e) => onUltimateRewardChange(e.target.value)}
            placeholder="例如：一次周末出游、购买期待已久的物品..."
            inputProps={{ maxLength: 200 }}
            helperText={`${ultimateReward.length}/200 字符`}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            我计划在这个日期前实现目标
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            为目标设定一个明确的时间期限，这能增加紧迫感并帮助你更好规划。
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
            <DatePicker
              label="目标日期"
              value={targetDate}
              onChange={onTargetDateChange}
              disablePast
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RewardsStep; 