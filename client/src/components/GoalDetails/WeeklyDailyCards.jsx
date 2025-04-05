import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Fade } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DailyCard from './DailyCard';
import styles from './WeeklyDailyCards.module.css';
import apiService from '../../services/api';

/**
 * WeeklyDailyCards - 显示一周的每日卡片组件
 * 
 * @param {Object} props
 * @param {Object} props.goal - 目标对象
 * @param {Array} props.dailyCards - 每日卡片数据数组
 * @param {Function} props.onCardsUpdate - 卡片数据更新回调
 */
export default function WeeklyDailyCards({ goal, dailyCards = [], onCardsUpdate }) {
  const [currentWeekCards, setCurrentWeekCards] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // 根据目标创建日期或当前日期生成一周的日期
  const generateWeekDates = (goalDate, offset = 0) => {
    const startDate = new Date(goalDate);
    // 计算起始日期，添加偏移周数
    startDate.setDate(startDate.getDate() + (offset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      weekDates.push(currentDate);
    }
    return weekDates;
  };
  
  // 初始化和更新卡片数据
  useEffect(() => {
    if (!goal) return;
    
    const updateWeekCards = () => {
      setIsLoading(true);
      
      const goalCreatedAt = goal.createdAt ? new Date(goal.createdAt) : new Date();
      const weekDates = generateWeekDates(goalCreatedAt, weekOffset);
      
      // 匹配现有的dailyCards或创建新的空卡片
      const newWeekCards = weekDates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        
        // 查找匹配的已有卡片
        const existingCard = dailyCards.find(card => {
          const cardDate = new Date(card.date);
          return cardDate.toISOString().split('T')[0] === dateStr;
        });
        
        // 如果找到匹配的卡片，返回它
        if (existingCard) {
          return existingCard;
        }
        
        // 否则创建一个新的空卡片
        return {
          date: date.toISOString(),
          dailyTask: goal.currentSettings?.dailyTask || '',
          dailyReward: goal.currentSettings?.dailyReward || '',
          completed: {
            dailyTask: false,
            dailyReward: false
          },
          note: ''
        };
      });
      
      setCurrentWeekCards(newWeekCards);
      setIsLoading(false);
    };
    
    updateWeekCards();
  }, [goal, dailyCards, weekOffset]);
  
  // 处理卡片更新
  const handleCardUpdate = async (updatedCard, index) => {
    try {
      // 更新本地状态
      const updatedCards = [...currentWeekCards];
      updatedCards[index] = updatedCard;
      setCurrentWeekCards(updatedCards);
      
      // 调用API保存更新
      if (goal && goal._id) {
        await apiService.goals.addOrUpdateDailyCard(goal._id, updatedCard);
        
        // 通知父组件更新
        if (onCardsUpdate) {
          onCardsUpdate(updatedCards);
        }
      }
    } catch (error) {
      console.error('更新每日卡片失败:', error);
      // 可以添加错误处理UI
    }
  };
  
  // 切换到前一周
  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };
  
  // 切换到后一周
  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };
  
  // 回到当前周
  const handleCurrentWeek = () => {
    setWeekOffset(0);
  };
  
  // 检查日期是否是今天
  const isToday = (dateStr) => {
    const today = new Date();
    const cardDate = new Date(dateStr);
    
    return (
      today.getFullYear() === cardDate.getFullYear() &&
      today.getMonth() === cardDate.getMonth() &&
      today.getDate() === cardDate.getDate()
    );
  };
  
  // 获取周标题显示
  const getWeekTitle = () => {
    if (!currentWeekCards.length) return '';
    
    const firstDate = new Date(currentWeekCards[0].date);
    const lastDate = new Date(currentWeekCards[6].date);
    
    const formatDate = (date) => {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    };
    
    return `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          每周打卡记录
        </Typography>
        
        <Box className={styles.weekControls}>
          <IconButton onClick={handlePreviousWeek} size="small">
            <ChevronLeftIcon />
          </IconButton>
          
          <Button 
            variant="text" 
            startIcon={<CalendarTodayIcon />}
            onClick={handleCurrentWeek}
            size="small"
            className={styles.weekTitle}
          >
            {getWeekTitle()}
          </Button>
          
          <IconButton 
            onClick={handleNextWeek} 
            size="small"
            disabled={weekOffset >= 0} // 不允许查看未来的周
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Fade in={!isLoading} timeout={500}>
        <Box className={styles.cardsContainer}>
          {currentWeekCards.map((card, index) => (
            <DailyCard 
              key={`${card.date}-${index}`}
              card={card}
              isToday={isToday(card.date)}
              onUpdate={(updatedCard) => handleCardUpdate(updatedCard, index)}
            />
          ))}
        </Box>
      </Fade>
    </Box>
  );
} 