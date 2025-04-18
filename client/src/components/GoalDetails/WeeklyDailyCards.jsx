import { useState, useEffect, useRef } from 'react';
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
  const containerRef = useRef(null);
  const [shouldScrollToToday, setShouldScrollToToday] = useState(true);
  
  // Helper function to get start of week (Sunday) for any date
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day); // Go to Sunday
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Helper function to format date to YYYY-MM-DD
  const formatDateToYMD = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Reset week offset when goal changes
  useEffect(() => {
    setWeekOffset(0);
  }, [goal?._id]);

  // Generate week dates and match with existing cards
  useEffect(() => {
    if (!goal) return;

    const updateWeekCards = () => {
      setIsLoading(true);

      try {
        // Get today and current week's Sunday
        const today = new Date();
        const currentWeekSunday = getStartOfWeek(today);
        
        // Calculate the target week's Sunday based on offset
        const targetWeekSunday = new Date(currentWeekSunday);
        targetWeekSunday.setDate(currentWeekSunday.getDate() + (weekOffset * 7));

        // Generate dates for the week
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(targetWeekSunday);
          date.setDate(targetWeekSunday.getDate() + i);
          return date;
        });

        console.log('Generating week:', {
          today: formatDateToYMD(today),
          weekStart: formatDateToYMD(targetWeekSunday),
          weekDates: weekDates.map(d => formatDateToYMD(d))
        });

        // Match with existing cards or create new ones
        const newWeekCards = weekDates.map(date => {
          const dateStr = formatDateToYMD(date);
          
          // Find matching existing card
          const existingCard = dailyCards.find(card => {
            if (!card.date) return false;
            return formatDateToYMD(new Date(card.date)) === dateStr;
          });

          if (existingCard) {
            return existingCard;
          }

          // Create new empty card
          return {
            date: date.toISOString(),
            dailyTask: goal.currentSettings?.dailyTask || '',
            dailyReward: goal.currentSettings?.dailyReward || '',
            completed: {
              dailyTask: false,
              dailyReward: false
            },
            records: [],
            taskCompletions: {}
          };
        });

        setCurrentWeekCards(newWeekCards);
      } catch (error) {
        console.error('Error updating week cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updateWeekCards();
  }, [goal, dailyCards, weekOffset]);
  
  // Check if a date is today
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    return formatDateToYMD(new Date(dateStr)) === formatDateToYMD(new Date());
  };
  
  // Add function to check if a date is in current week
  const isDateInCurrentWeek = (dateStr) => {
    if (!currentWeekCards.length) return false;
    
    try {
      const targetDate = formatDateToYMD(dateStr);
      const firstWeekDate = formatDateToYMD(currentWeekCards[0].date);
      const lastWeekDate = formatDateToYMD(currentWeekCards[6].date);
      
      console.log('Checking date in week:', {
        targetDate,
        firstWeekDate,
        lastWeekDate,
        isInRange: targetDate >= firstWeekDate && targetDate <= lastWeekDate
      });
      
      return targetDate >= firstWeekDate && targetDate <= lastWeekDate;
    } catch (error) {
      console.error('Error checking if date is in current week:', error);
      return false;
    }
  };
  
  // Add function to calculate week offset for a date
  const calculateWeekOffset = (targetDate, baseDate) => {
    const target = new Date(targetDate);
    const base = new Date(baseDate);
    
    // Reset time parts to ensure accurate day calculation
    target.setHours(0, 0, 0, 0);
    base.setHours(0, 0, 0, 0);
    
    // Get the start of week for both dates
    const targetDay = target.getDay();
    const baseDay = base.getDay();
    
    const targetWeekStart = new Date(target);
    targetWeekStart.setDate(target.getDate() - targetDay);
    
    const baseWeekStart = new Date(base);
    baseWeekStart.setDate(base.getDate() - baseDay);
    
    // Calculate the difference in weeks
    const diffTime = targetWeekStart.getTime() - baseWeekStart.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
    
    return diffWeeks;
  };
  
  // Navigate to previous week
  const handlePreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };
  
  // Navigate to next week
  const handleNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };
  
  // Navigate to current week
  const handleCurrentWeek = () => {
    setWeekOffset(0);
  };
  
  // Get week range for display
  const getWeekTitle = () => {
    if (!currentWeekCards.length) return '';
    
    const firstDate = new Date(currentWeekCards[0].date);
    const lastDate = new Date(currentWeekCards[6].date);
    
    const formatDate = (date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    return `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
  };
  
  // Handle card updates
  const handleCardUpdate = async (updatedCard, index) => {
    try {
      // Ensure card data contains task completion status
      if (!updatedCard.taskCompletions) {
        updatedCard.taskCompletions = {};
      }

      console.log('WeeklyDailyCards - handleCardUpdate - Updating card data:', {
        index,
        date: updatedCard.date,
        taskCompletions: updatedCard.taskCompletions
      });
      
      // Use deep copy to update local state, avoid object reference issues
      const updatedCards = [...currentWeekCards];
      // Use deep copy to replace card
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
        console.log('WeeklyDailyCards - handleCardUpdate - Calling onCardsUpdate to notify GoalDetails');
        onCardsUpdate(updatedCards);
      }
    } catch (error) {
      console.error('Failed to update daily card:', error);
      // Error handling UI could be added here
    }
  };
  
  // Ensure card data has valid date field
  const validateCardData = (cardData) => {
    // Save original important data
    const originalCompletions = cardData.taskCompletions || {};
    const originalRecords = cardData.records || [];
    const originalCompleted = cardData.completed || { dailyTask: false };
    
    // If no date or invalid date, use current date but preserve other data
    if (!cardData.date) {
      console.warn('Card missing date, adding current date:', cardData);
      return {
        ...cardData,
        date: new Date().toISOString(),
        // Ensure original task completion status and records are preserved
        taskCompletions: originalCompletions,
        records: originalRecords,
        completed: originalCompleted
      };
    }
    
    // Try to parse date, if invalid reset to current date
    try {
      const testDate = new Date(cardData.date);
      if (isNaN(testDate.getTime())) {
        console.warn('Card has invalid date, resetting:', cardData.date);
        return {
          ...cardData,
          date: new Date().toISOString(),
          // Ensure original task completion status and records are preserved
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
        // Ensure original task completion status and records are preserved
        taskCompletions: originalCompletions,
        records: originalRecords,
        completed: originalCompleted
      };
    }
    
    // If date is valid, keep unchanged
    return cardData;
  };
  
  // Handle declaration view request
  const handleViewDeclaration = () => {
    if (onViewDeclaration && goal) {
      onViewDeclaration(goal);
    }
  };
  
  // Modify scrollToToday function
  const scrollToToday = () => {
    console.log('Attempting to scroll to today');
    if (!containerRef.current) {
      console.log('Container ref not available');
      return;
    }
    
    const today = new Date();
    const todayYMD = formatDateToYMD(today);
    
    console.log('Current week cards:', currentWeekCards.map(card => formatDateToYMD(card.date)));
    
    // If today is not in current week, calculate the correct offset
    if (!isDateInCurrentWeek(today)) {
      console.log('Today is not in current week, calculating offset');
      
      const firstWeekDate = new Date(currentWeekCards[0].date);
      const offset = calculateWeekOffset(today, firstWeekDate);
      
      console.log('Week adjustment:', {
        today: todayYMD,
        firstWeekDate: formatDateToYMD(firstWeekDate),
        currentOffset: weekOffset,
        calculatedOffset: offset,
        newOffset: weekOffset + offset
      });
      
      setWeekOffset(prev => prev + offset);
      setShouldScrollToToday(true);
      return;
    }
    
    // Perform the scroll
    const todayIndex = currentWeekCards.findIndex(card => 
      formatDateToYMD(card.date) === todayYMD
    );
    
    console.log('Scroll to today:', {
      todayIndex,
      todayYMD,
      cardDates: currentWeekCards.map(card => formatDateToYMD(card.date)),
      cardElements: containerRef.current.getElementsByClassName('daily-card').length
    });
    
    if (todayIndex === -1) return;
    
    const cardElements = containerRef.current.getElementsByClassName('daily-card');
    if (cardElements[todayIndex]) {
      cardElements[todayIndex].scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Modify useEffect to handle week switching and scrolling
  useEffect(() => {
    console.log('useEffect triggered:', {
      isLoading,
      cardsLength: currentWeekCards.length,
      shouldScrollToToday,
      weekOffset
    });
    
    if (!isLoading && currentWeekCards.length > 0 && shouldScrollToToday) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToToday();
        setShouldScrollToToday(false);
      }, 100);
    }
  }, [isLoading, currentWeekCards, shouldScrollToToday, weekOffset]);

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
    <Box className={styles.container} ref={containerRef} sx={{ 
      maxWidth: '100%', 
      width: '100%', 
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
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
            sx={{ color: '#0D5E6D' }}
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
        <Box sx={{ 
          width: '100%', 
          pb: 1,
          overflow: 'hidden'
        }}>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 0.5,
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {currentWeekCards.map((card, index) => {
              // Check for duplicate Saturday dates (solve date duplication issue)
              if (index > 0 && index < currentWeekCards.length) {
                const prevCardDate = new Date(currentWeekCards[index-1].date);
                const thisCardDate = new Date(card.date);
                
                // If dates between adjacent cards are the same, skip rendering
                if (
                  prevCardDate.getFullYear() === thisCardDate.getFullYear() &&
                  prevCardDate.getMonth() === thisCardDate.getMonth() &&
                  prevCardDate.getDate() === thisCardDate.getDate()
                ) {
                  console.log('Skipping duplicate date card:', {
                    previousCard: prevCardDate.toLocaleDateString(),
                    currentCard: thisCardDate.toLocaleDateString(),
                    index: index
                  });
                  return null;
                }
              }

              // Validate card data, ensure date is valid
              const validatedCard = validateCardData(card);
              
              return (
                <Box 
                  key={`${validatedCard.date}-${index}`} 
                  sx={{ 
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <DailyCard 
                    card={validatedCard}
                    goal={goal}
                    isToday={isToday(validatedCard.date)}
                    onUpdate={(updatedCard) => handleCardUpdate(updatedCard, index)}
                    onViewDeclaration={handleViewDeclaration}
                    isArchived={isArchived}
                    className="daily-card"
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