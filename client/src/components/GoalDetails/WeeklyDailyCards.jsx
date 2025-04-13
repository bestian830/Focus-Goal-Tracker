import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Fade, CircularProgress, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DailyCard from './DailyCard';
import DailyTasks from './DailyTasks';
import styles from './WeeklyDailyCards.module.css';
import apiService from '../../services/api';
import { getWeek, getStartOfWeek } from '../../utils/dateUtils';

/**
 * WeeklyDailyCards - Displays a week of daily cards for a goal
 * 
 * @param {Object} props
 * @param {Object} props.goal - Goal object
 * @param {Array} props.dailyCards - Array of daily card data
 * @param {Function} props.onCardsUpdate - Callback for when cards are updated
 * @param {Function} props.onViewDeclaration - Callback for viewing goal declaration
 * @param {boolean} props.isArchived - Indicates if the goal is archived
 */
export default function WeeklyDailyCards({ goal, dailyCards = [], onCardsUpdate, onViewDeclaration, isArchived }) {
  const [currentWeekCards, setCurrentWeekCards] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  
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
          records: [],
          taskCompletions: {} // 添加任务完成状态字段，初始化为空对象
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
      // 确保卡片数据中包含任务完成状态
      if (!updatedCard.taskCompletions) {
        updatedCard.taskCompletions = {};
      }

      console.log('WeeklyDailyCards - handleCardUpdate - 更新卡片数据:', {
        index,
        日期: updatedCard.date,
        任务完成状态: updatedCard.taskCompletions
      });
      
      // 使用深拷贝更新本地状态，避免对象引用问题
      const updatedCards = [...currentWeekCards];
      // 使用深拷贝替换卡片
      updatedCards[index] = JSON.parse(JSON.stringify(updatedCard));
      setCurrentWeekCards(updatedCards);
      
      // Call API to save the update - Restored to ensure data persistence
      if (goal && goal._id) {
        console.log('WeeklyDailyCards - handleCardUpdate - Calling API to save card data to database');
        try {
          const response = await apiService.goals.addOrUpdateDailyCard(goal._id, updatedCard);
          console.log('API response success:', response.data.success);
        } catch (apiError) {
          console.error('API save error:', apiError);
          // Continue with local update even if API call fails
        }
      }
        
      // Notify parent component of update
      if (onCardsUpdate) {
        console.log('WeeklyDailyCards - handleCardUpdate - 调用 onCardsUpdate 通知 GoalDetails');
        onCardsUpdate(updatedCards);
      }
    } catch (error) {
      console.error('Failed to update daily card:', error);
      // Error handling UI could be added here
    }
  };
  
  // 确保卡片数据中date字段有效
  const validateCardData = (cardData) => {
    // 保存原始的重要数据
    const originalCompletions = cardData.taskCompletions || {};
    const originalRecords = cardData.records || [];
    const originalCompleted = cardData.completed || { dailyTask: false };
    
    // 如果没有日期或日期无效，使用当前日期，但保留其他数据
    if (!cardData.date) {
      console.warn('Card missing date, adding current date:', cardData);
      return {
        ...cardData,
        date: new Date().toISOString(),
        // 确保保留原始的任务完成状态和记录
        taskCompletions: originalCompletions,
        records: originalRecords,
        completed: originalCompleted
      };
    }
    
    // 尝试解析日期，如果无效则重置为当前日期
    try {
      const testDate = new Date(cardData.date);
      if (isNaN(testDate.getTime())) {
        console.warn('Card has invalid date, resetting:', cardData.date);
        return {
          ...cardData,
          date: new Date().toISOString(),
          // 确保保留原始的任务完成状态和记录
          taskCompletions: originalCompletions,
          records: originalRecords,
          completed: originalCompleted
        };
      }
    } catch (e) {
      console.error('Error validating card date:', e);
      return {
        ...cardData,
        date: new Date().toISOString(),
        // 确保保留原始的任务完成状态和记录
        taskCompletions: originalCompletions,
        records: originalRecords,
        completed: originalCompleted
      };
    }
    
    // 如果日期有效，保持不变
    return cardData;
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
      if (!dateStr) {
        console.warn('Empty date string provided to isToday');
        return false;
      }
      
      // 獲取本地日期（YYYY-MM-DD格式）而不是UTC
      const localToday = new Date();
      localToday.setHours(0, 0, 0, 0);
      const todayYMD = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`;
      
      // 解析傳入的日期字符串，轉換為本地日期格式
      let dateYMD;
      try {
        // 創建日期對象
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) {
          console.error('Invalid date in isToday:', dateStr);
          return false;
        }
        
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

  // Return loading UI if data is not yet loaded
  if (isLoading) {
    return (
      <Box className={styles.loadingContainer} sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading your progress data...
        </Typography>
      </Box>
    );
  }

  // Return empty state if no cards yet
  if (currentWeekCards.length === 0) {
    return (
      <Box className={styles.emptyContainer} sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
          No progress data yet
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: '80%', mx: 'auto' }}>
          Start tracking your daily progress by adding notes and tasks for each day.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleViewDeclaration}
          startIcon={<BookmarkIcon />}
          sx={{ borderRadius: '20px' }}
        >
          View Goal Declaration
        </Button>
      </Box>
    );
  }

  return (
    <Box className={styles.container} sx={{ maxWidth: '100%' }}>
      <Box className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          Weekly Progress Cards
        </Typography>
        
        <Box className={styles.weekControls}>
          <Tooltip title="Previous week">
            <IconButton
              onClick={handlePreviousWeek}
              disabled={isLoading || isArchived}
              size="small"
              sx={{ borderRadius: '4px' }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          
          <Button 
            variant="text" 
            startIcon={<CalendarTodayIcon />}
            onClick={handleCurrentWeek}
            size="small"
            className={styles.weekTitle}
          >
            {getWeekTitle()}
          </Button>
          
          <Tooltip title="Next week">
            <IconButton
              onClick={handleNextWeek}
              disabled={isLoading || isArchived}
              size="small"
              sx={{ borderRadius: '4px' }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Fade in={!isLoading} timeout={500}>
        <Box sx={{ overflowX: {xs: 'auto', md: 'visible'}, width: '100%', pb: 1 }}>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(80px, 1fr))',
              gap: {xs: 0.5, sm: 1, md: 1},
              width: {xs: 'max-content', md: '100%'},
              minWidth: '100%'
            }}
          >
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

              // 验证卡片数据，确保日期有效
              const validatedCard = validateCardData(card);
              
              return (
                <Box key={`${validatedCard.date}-${index}`} sx={{ width: '100%' }}>
                  <DailyCard 
                    card={validatedCard}
                    goal={goal}
                    isToday={isToday(validatedCard.date)}
                    onUpdate={(updatedCard) => handleCardUpdate(updatedCard, index)}
                    onViewDeclaration={handleViewDeclaration}
                    isArchived={isArchived}
                  />
                </Box>
              );
            }).filter(Boolean)} {/* 过滤掉null值 */}
          </Box>
        </Box>
      </Fade>

      {/* Task detail dialog */}
      {activeCard && (
        <DailyTasks
          open={!!activeCard}
          onClose={() => setActiveCard(null)}
          card={activeCard}
          goal={goal}
          onCardUpdate={handleCardUpdate}
          isArchived={isArchived}
        />
      )}
    </Box>
  );
} 