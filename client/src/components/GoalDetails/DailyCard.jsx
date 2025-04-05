import { useState } from 'react';
import { Box, Typography, Checkbox, TextField, Paper, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './DailyCard.module.css';

/**
 * DailyCard - 显示单个日期的每日任务卡片
 * 
 * @param {Object} props
 * @param {Object} props.card - 卡片数据对象
 * @param {Date|String} props.card.date - 卡片日期
 * @param {String} props.card.dailyTask - 每日任务描述
 * @param {String} props.card.dailyReward - 每日奖励描述
 * @param {Object} props.card.completed - 完成状态对象
 * @param {Boolean} props.card.completed.dailyTask - 每日任务完成状态
 * @param {Boolean} props.card.completed.dailyReward - 每日奖励完成状态
 * @param {Function} props.onUpdate - 卡片更新回调
 * @param {Boolean} props.isToday - 是否为今天的卡片
 */
export default function DailyCard({ card, onUpdate, isToday }) {
  const [taskCompleted, setTaskCompleted] = useState(card?.completed?.dailyTask || false);
  const [rewardClaimed, setRewardClaimed] = useState(card?.completed?.dailyReward || false);
  const [note, setNote] = useState('');
  
  // 格式化日期显示
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
    const weekday = weekdays[date.getDay()];
    
    return { monthDay, weekday };
  };
  
  const { monthDay, weekday } = formatDate(card?.date);
  
  // 处理任务完成状态变更
  const handleTaskToggle = () => {
    const newState = !taskCompleted;
    setTaskCompleted(newState);
    
    if (onUpdate) {
      onUpdate({
        ...card,
        completed: {
          ...card.completed,
          dailyTask: newState
        }
      });
    }
  };
  
  // 处理奖励领取状态变更
  const handleRewardToggle = () => {
    const newState = !rewardClaimed;
    setRewardClaimed(newState);
    
    if (onUpdate) {
      onUpdate({
        ...card,
        completed: {
          ...card.completed,
          dailyReward: newState
        }
      });
    }
  };
  
  // 处理笔记变更
  const handleNoteChange = (e) => {
    setNote(e.target.value);
    // 可以设置防抖处理，避免频繁更新
  };

  return (
    <Paper 
      elevation={isToday ? 3 : 1} 
      className={`${styles.card} ${isToday ? styles.todayCard : ''}`}
    >
      {/* 卡片头部-日期 */}
      <Box className={styles.cardHeader}>
        <Typography variant="subtitle2" className={styles.weekday}>
          周{weekday}
        </Typography>
        <Typography variant="body2" className={styles.date}>
          {monthDay}
        </Typography>
        {isToday && (
          <Chip 
            label="今天" 
            size="small" 
            color="primary" 
            className={styles.todayChip}
          />
        )}
      </Box>
      
      {/* 每日任务 */}
      <Box className={styles.taskSection}>
        <Box className={styles.taskHeader}>
          <Typography variant="body2" className={styles.sectionTitle}>
            每日任务
          </Typography>
          <Checkbox 
            checked={taskCompleted}
            onChange={handleTaskToggle}
            icon={<CheckCircleIcon className={styles.uncheckedIcon} />}
            checkedIcon={<CheckCircleIcon className={styles.checkedIcon} />}
            disabled={!isToday && new Date(card?.date) > new Date()}
          />
        </Box>
        <Typography variant="body2" className={styles.taskText}>
          {card?.dailyTask || '未设置任务'}
        </Typography>
      </Box>
      
      {/* 每日奖励 */}
      <Box className={styles.rewardSection}>
        <Box className={styles.rewardHeader}>
          <Typography variant="body2" className={styles.sectionTitle}>
            每日奖励
          </Typography>
          <Checkbox 
            checked={rewardClaimed}
            onChange={handleRewardToggle}
            icon={<CheckCircleIcon className={styles.uncheckedIcon} />}
            checkedIcon={<CheckCircleIcon className={styles.checkedIcon} />}
            disabled={!taskCompleted || (!isToday && new Date(card?.date) > new Date())}
          />
        </Box>
        <Typography variant="body2" className={styles.rewardText}>
          {card?.dailyReward || '未设置奖励'}
        </Typography>
      </Box>
      
      {/* 笔记区域 - 只在今天的卡片上显示输入框 */}
      {isToday ? (
        <TextField
          variant="outlined"
          size="small"
          placeholder="添加今日笔记..."
          multiline
          rows={2}
          fullWidth
          value={note}
          onChange={handleNoteChange}
          className={styles.noteInput}
        />
      ) : (
        card?.note && (
          <Typography variant="body2" className={styles.noteText}>
            {card.note}
          </Typography>
        )
      )}
    </Paper>
  );
} 