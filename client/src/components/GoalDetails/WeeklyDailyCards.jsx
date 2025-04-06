import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Fade } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DailyCard from './DailyCard';
import styles from './WeeklyDailyCards.module.css';
import apiService from '../../services/api';

/**
 * WeeklyDailyCards - Displays a week of daily cards for a goal
 * 
 * @param {Object} props
 * @param {Object} props.goal - Goal object
 * @param {Array} props.dailyCards - Array of daily card data
 * @param {Function} props.onCardsUpdate - Callback for when cards are updated
 * @param {Function} props.onViewDeclaration - Callback for viewing goal declaration
 */
export default function WeeklyDailyCards({ goal, dailyCards = [], onCardsUpdate, onViewDeclaration }) {
  const [currentWeekCards, setCurrentWeekCards] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate a week of dates based on goal creation date or current date
  const generateWeekDates = (goalDate, offset = 0) => {
    // 使用本地時間處理，不使用 UTC
    const startDate = new Date(goalDate);
    
    // 獲取當前星期的起始日
    const day = startDate.getDay(); // 0 = 星期日, 1 = 星期一, ...
    
    // 為了處理周六重複問題，先使用標準邏輯獲取本週的星期日
    const adjustedDate = new Date(startDate);
    adjustedDate.setDate(startDate.getDate() - day); // 調整到本週的星期日
    
    // 添加偏移週數
    adjustedDate.setDate(adjustedDate.getDate() + (offset * 7));
    
    console.log('Generating week dates:', {
      originalDate: goalDate,
      adjustedStartDate: adjustedDate.toLocaleDateString(),
      weekDay: day,
      offset
    });
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      // 創建新日期對象，避免修改原始日期
      const currentDate = new Date(adjustedDate);
      currentDate.setDate(adjustedDate.getDate() + i);
      
      // 移除時間部分，只保留日期（重要，避免跨日期邊界問題）
      currentDate.setHours(0, 0, 0, 0);
      
      weekDates.push(currentDate);
      
      console.log(`創建第 ${i+1} 天:`, {
        日期: currentDate.toLocaleDateString(),
        ISO: currentDate.toISOString(),
        星期: currentDate.getDay()
      });
    }
    
    return weekDates;
  };
  
  // Initialize and update card data
  useEffect(() => {
    if (!goal) return;
    
    const updateWeekCards = () => {
      setIsLoading(true);
      
      const goalCreatedAt = goal.createdAt ? new Date(goal.createdAt) : new Date();
      const weekDates = generateWeekDates(goalCreatedAt, weekOffset);
      
      // Match existing dailyCards or create new empty cards
      const newWeekCards = weekDates.map(date => {
        // 使用 ISO 字符串格式，但只保留日期部分 (YYYY-MM-DD)
        const dateStr = date.toISOString().split('T')[0];
        
        console.log('Processing weekly date:', {
          date,
          dateStr,
          isoString: date.toISOString(),
          dateString: date.toString()
        });
        
        // Find matching existing card
        const existingCard = dailyCards.find(card => {
          try {
            if (!card.date) return false;
            
            // 嘗試提取卡片日期的 YYYY-MM-DD 部分
            let cardDateStr;
            try {
              // 如果已經是 ISO 字符串，直接分割
              if (typeof card.date === 'string' && card.date.includes('T')) {
                cardDateStr = card.date.split('T')[0];
              } else {
                // 否則創建日期對象並轉換為 ISO 格式
                const cardDate = new Date(card.date);
                if (isNaN(cardDate.getTime())) return false;
                cardDateStr = cardDate.toISOString().split('T')[0];
              }
            } catch (err) {
              console.error('Error extracting date string:', err, card.date);
              return false;
            }
            
            // 日誌記錄用於調試
            console.log('Comparing dates:', {
              weekDateStr: dateStr, 
              cardDateStr,
              match: cardDateStr === dateStr
            });
            
            return cardDateStr === dateStr;
          } catch (error) {
            console.error('Error comparing card dates:', error, card);
            return false;
          }
        });
        
        // If a matching card is found, return it
        if (existingCard) {
          console.log('Found existing card:', existingCard);
          return existingCard;
        }
        
        // Otherwise create a new empty card
        const newCard = {
          date: date.toISOString(), // 使用完整 ISO 字符串
          dailyTask: goal.currentSettings?.dailyTask || '',
          dailyReward: goal.currentSettings?.dailyReward || '',
          completed: {
            dailyTask: false,
            dailyReward: false
          },
          records: []
        };
        
        console.log('Created new card:', newCard);
        return newCard;
      });
      
      setCurrentWeekCards(newWeekCards);
      setIsLoading(false);
    };
    
    updateWeekCards();
  }, [goal, dailyCards, weekOffset]);
  
  // Handle card updates
  const handleCardUpdate = async (updatedCard, index) => {
    try {
      // Update local state
      const updatedCards = [...currentWeekCards];
      updatedCards[index] = updatedCard;
      setCurrentWeekCards(updatedCards);
      
      // Call API to save the update
      if (goal && goal._id) {
        await apiService.goals.addOrUpdateDailyCard(goal._id, updatedCard);
        
        // Notify parent component of update
        if (onCardsUpdate) {
          onCardsUpdate(updatedCards);
        }
      }
    } catch (error) {
      console.error('Failed to update daily card:', error);
      // Error handling UI could be added here
    }
  };
  
  // Handle declaration view request
  const handleViewDeclaration = () => {
    if (onViewDeclaration && goal) {
      onViewDeclaration(goal);
    }
  };
  
  // Switch to previous week
  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };
  
  // Switch to next week
  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };
  
  // Return to current week
  const handleCurrentWeek = () => {
    setWeekOffset(0);
  };
  
  // Check if a date is today
  const isToday = (dateStr) => {
    try {
      if (!dateStr) return false;
      
      // 獲取本地日期（YYYY-MM-DD格式）而不是UTC
      const localToday = new Date();
      localToday.setHours(0, 0, 0, 0);
      const todayYMD = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;
      
      // 解析傳入的日期字符串，轉換為本地日期格式
      let dateYMD;
      try {
        // 創建日期對象
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return false;
        
        // 轉換為本地日期格式 YYYY-MM-DD
        dateYMD = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      } catch (err) {
        console.error('Error extracting date for isToday check:', err);
        return false;
      }
      
      console.log('Comparing today:', {
        input: dateStr,
        inputType: typeof dateStr,
        parsed: dateYMD,
        today: todayYMD,
        match: dateYMD === todayYMD
      });
      
      return dateYMD === todayYMD;
    } catch (error) {
      console.error('Error checking if date is today:', error, dateStr);
      return false;
    }
  };
  
  // Get week title for display
  const getWeekTitle = () => {
    try {
      if (!currentWeekCards.length) return '';
      
      // Ensure dates are valid
      const firstCardDate = currentWeekCards[0]?.date;
      const lastCardDate = currentWeekCards[6]?.date;
      
      if (!firstCardDate || !lastCardDate) return '';
      
      const firstDate = new Date(firstCardDate);
      const lastDate = new Date(lastCardDate);
      
      // Verify dates are valid
      if (isNaN(firstDate.getTime()) || isNaN(lastDate.getTime())) {
        return 'Week Range';
      }
      
      const formatDate = (date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      };
      
      return `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
    } catch (error) {
      console.error('Error generating week title:', error);
      return 'Week Range';
    }
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          Weekly Progress Cards
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
            disabled={weekOffset >= 0} // Don't allow viewing future weeks
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Fade in={!isLoading} timeout={500}>
        <Box className={styles.cardsContainer}>
          {currentWeekCards.map((card, index) => {
            // 检查是否重复的周六日期（解决日期重复问题）
            if (index > 0 && index < currentWeekCards.length) {
              const prevCardDate = new Date(currentWeekCards[index-1].date);
              const thisCardDate = new Date(card.date);
              
              // 如果前后两个日期相同，跳过渲染
              if (
                prevCardDate.getFullYear() === thisCardDate.getFullYear() &&
                prevCardDate.getMonth() === thisCardDate.getMonth() &&
                prevCardDate.getDate() === thisCardDate.getDate()
              ) {
                console.log('跳过重复的日期卡片:', {
                  前一个卡片: prevCardDate.toLocaleDateString(),
                  当前卡片: thisCardDate.toLocaleDateString(),
                  索引: index
                });
                return null;
              }
            }
            
            return (
              <DailyCard 
                key={`${card.date}-${index}`}
                card={card}
                goal={goal}
                isToday={isToday(card.date)}
                onUpdate={(updatedCard) => handleCardUpdate(updatedCard, index)}
                onViewDeclaration={onViewDeclaration}
              />
            );
          }).filter(Boolean)} {/* 过滤掉null值 */}
        </Box>
      </Fade>
    </Box>
  );
} 