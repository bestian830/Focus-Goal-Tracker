import { useState } from 'react';
import { Box, Typography, Paper, Badge } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import styles from './DailyCard.module.css';
import DailyCardRecord from './DailyCardRecord';
import apiService from '../../services/api';

/**
 * DailyCard - Displays a single date's card showing task completion status
 * 
 * @param {Object} props
 * @param {Object} props.card - Card data for the specific date
 * @param {Object} props.goal - Goal object
 * @param {Boolean} props.isToday - Whether this card represents today
 * @param {Function} props.onUpdate - Callback for when card data is updated
 * @param {Function} props.onViewDeclaration - Optional callback for viewing declaration
 */
export default function DailyCard({ card, goal, isToday, onUpdate, onViewDeclaration }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format the date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        console.warn('Empty date string provided to formatDate');
        return '--';
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '--';
      }
      return date.getDate();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '--';
    }
  };

  // Format the day name for display
  const formatDay = (dateString) => {
    try {
      if (!dateString) {
        console.warn('Empty date string provided to formatDay');
        return '--';
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid day:', dateString);
        return '--';
      }
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch (error) {
      console.error('Error formatting day:', error);
      return '--';
    }
  };

  // Handle card click to open details
  const handleCardClick = async () => {
    // Show loading state while we prepare to open the dialog
    setLoading(true);
    
    try {
      // If we have an onUpdate callback (which should come from WeeklyDailyCards),
      // we can use it to refresh the goal data before opening the dialog
      if (onUpdate && goal && goal._id) {
        console.log('DailyCard - Refreshing goal data before opening record dialog');
        
        try {
          // This helps ensure we have the most up-to-date card data
          const response = await apiService.goals.getById(goal._id);
          if (response?.data?.data) {
            console.log('DailyCard - Retrieved latest goal data');
            
            // Find the card for this date in the fresh data
            const refreshedGoal = response.data.data;
            const targetDate = new Date(card.date);
            const targetDateStr = targetDate.toISOString().split('T')[0];
            
            // Look for matching card in the refreshed data
            let foundCard = false;
            refreshedGoal.dailyCards?.forEach(card => {
              const cardDate = new Date(card.date);
              const cardDateStr = cardDate.toISOString().split('T')[0];
              
              if (cardDateStr === targetDateStr) {
                console.log('DailyCard - Found matching card in refreshed data');
                foundCard = true;
              }
            });
            
            console.log('DailyCard - Data refresh completed, found card:', foundCard);
          }
        } catch (error) {
          console.error('DailyCard - Error refreshing data before opening dialog:', error);
          // Continue opening the dialog even if refresh fails
        }
      }
    } finally {
      // Open the dialog and hide loading indicator
      setLoading(false);
      setDetailsOpen(true);
    }
  };

  // Handle closing the details view
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  // Handle saving the card after editing
  const handleSaveCard = (updatedCard) => {
    if (onUpdate) {
      onUpdate(updatedCard);
    }
  };

  // Handle viewing the declaration
  const handleViewDeclaration = () => {
    if (onViewDeclaration) {
      onViewDeclaration();
    }
  };
  
  // Determine if the card has any completed tasks
  const hasCompletedTasks = card.completed && card.completed.dailyTask;
  
  // Determine if card has progress records
  const hasRecords = card.records && card.records.length > 0;

  const formattedDay = formatDay(card.date);
  const formattedDate = formatDate(card.date);
  const today = isToday;

  return (
    <>
      <Paper 
        className={`${styles.card} ${today ? styles.today : ''}`}
        onClick={handleCardClick}
        elevation={1}
      >
        <Box className={styles.dateInfo}>
          <Typography variant="caption" className={styles.day}>
            {formattedDay}
          </Typography>
          <Typography variant="h6" className={styles.date}>
            {formattedDate}
          </Typography>
        </Box>
        
        <Box className={styles.todayLabelContainer}>
          {today && (
            <Typography variant="caption" className={styles.todayLabel}>
              Today
            </Typography>
          )}
        </Box>
        
        <Box className={styles.bottomSection}>
          <Box className={styles.statusInfo}>
            <Badge 
              color="success" 
              variant={hasCompletedTasks ? "dot" : "standard"}
              invisible={!hasCompletedTasks}
            >
              <AssignmentIcon 
                color={hasCompletedTasks ? "primary" : "action"} 
                fontSize="small" 
              />
            </Badge>
          </Box>
          
          <Box className={styles.recordsInfo}>
            {hasRecords ? (
              <Typography variant="caption" className={styles.recordsCount}>
                {card.records.length} {card.records.length === 1 ? 'note' : 'notes'}
              </Typography>
            ) : (
              <div className={styles.emptyRecords}></div>
            )}
          </Box>
        </Box>
      </Paper>
      
      <DailyCardRecord
        goal={goal}
        date={card.date}
        open={detailsOpen}
        onClose={handleCloseDetails}
        onSave={handleSaveCard}
        onViewDeclaration={handleViewDeclaration}
      />
    </>
  );
} 