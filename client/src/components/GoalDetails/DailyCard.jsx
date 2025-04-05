import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import styles from './DailyCard.module.css';

/**
 * DailyCard - 显示单个日期的卡片，简化版本只显示日期
 * 
 * @param {Object} props
 * @param {Object} props.card - 卡片数据对象
 * @param {Date|String} props.card.date - 卡片日期
 * @param {Boolean} props.isToday - 是否为今天的卡片
 * @param {Function} props.onUpdate - 卡片更新回调
 */
export default function DailyCard({ card, onUpdate, isToday }) {
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  // 处理卡片点击
  const handleCardClick = () => {
    // 处理卡片点击事件，可用于打开详细视图
    console.log('卡片点击：', card);
    // 这里可以添加导航或打开对话框的逻辑
  };

  return (
    <Paper 
      elevation={isToday ? 3 : 1} 
      className={`${styles.card} ${isToday ? styles.todayCard : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 日期显示 - 简化版本 */}
      <Box className={styles.dateDisplay}>
        {isToday && <div className={styles.todayIndicator} />}
        
        <Typography variant="h6" className={styles.weekday}>
          周{weekday}
        </Typography>
        
        <Typography variant="body1" className={styles.date}>
          {monthDay}
        </Typography>
      </Box>
    </Paper>
  );
} 