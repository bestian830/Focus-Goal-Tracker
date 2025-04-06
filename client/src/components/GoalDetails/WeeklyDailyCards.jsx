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
 */
export default function WeeklyDailyCards({ goal, dailyCards = [], onCardsUpdate }) {
  const [currentWeekCards, setCurrentWeekCards] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate a week of dates based on goal creation date or current date
  const generateWeekDates = (goalDate, offset = 0) => {
    const startDate = new Date(goalDate);
    // Calculate start date, adding offset weeks
    startDate.setDate(startDate.getDate() + (offset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      weekDates.push(currentDate);
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
        const dateStr = date.toISOString().split('T')[0];
        
        // Find matching existing card
        const existingCard = dailyCards.find(card => {
          const cardDate = new Date(card.date);
          return cardDate.toISOString().split('T')[0] === dateStr;
        });
        
        // If a matching card is found, return it
        if (existingCard) {
          return existingCard;
        }
        
        // Otherwise create a new empty card
        return {
          date: date.toISOString(),
          dailyTask: goal.currentSettings?.dailyTask || '',
          dailyReward: goal.currentSettings?.dailyReward || '',
          completed: {
            dailyTask: false,
            dailyReward: false
          },
          records: []
        };
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
    const today = new Date();
    const cardDate = new Date(dateStr);
    
    return (
      today.getFullYear() === cardDate.getFullYear() &&
      today.getMonth() === cardDate.getMonth() &&
      today.getDate() === cardDate.getDate()
    );
  };
  
  // Get week title for display
  const getWeekTitle = () => {
    if (!currentWeekCards.length) return '';
    
    const firstDate = new Date(currentWeekCards[0].date);
    const lastDate = new Date(currentWeekCards[6].date);
    
    const formatDate = (date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    return `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
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
          {currentWeekCards.map((card, index) => (
            <DailyCard 
              key={`${card.date}-${index}`}
              card={card}
              goal={goal}
              isToday={isToday(card.date)}
              onUpdate={(updatedCard) => handleCardUpdate(updatedCard, index)}
            />
          ))}
        </Box>
      </Fade>
    </Box>
  );
} 