import { useState } from 'react';
import { Box, Typography, Paper, Badge } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import styles from './DailyCard.module.css';
import DailyCardRecord from './DailyCardRecord';

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

  // Format the date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}`;
  };

  // Format the day name for display
  const formatDay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Handle card click to open details
  const handleCardClick = () => {
    setDetailsOpen(true);
  };

  // Handle closing the details view
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  // Handle saving updated card data
  const handleSaveCard = (updatedCard) => {
    if (onUpdate) {
      onUpdate(updatedCard);
    }
  };

  // Handle viewing declaration details
  const handleViewDeclaration = () => {
    // If an external handler is provided, use it
    if (onViewDeclaration) {
      onViewDeclaration(goal);
      return;
    }
    
    // Fallback behavior if no handler is provided
    console.log('View declaration for goal:', goal?.title);
  };
  
  // Determine if the card has any completed tasks
  const hasCompletedTasks = card.completed && card.completed.dailyTask;
  
  // Determine if card has progress records
  const hasRecords = card.records && card.records.length > 0;

  return (
    <>
      <Paper 
        className={`${styles.card} ${isToday ? styles.today : ''}`}
        onClick={handleCardClick}
        elevation={isToday ? 3 : 1}
      >
        <Box className={styles.dateInfo}>
          <Typography variant="caption" className={styles.day}>
            {formatDay(card.date)}
          </Typography>
          <Typography variant="h6" className={styles.date}>
            {formatDate(card.date)}
          </Typography>
          {isToday && (
            <Typography variant="caption" className={styles.todayLabel}>
              Today
            </Typography>
          )}
        </Box>
        
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
          {hasRecords && (
            <Typography variant="caption" className={styles.recordsCount}>
              {card.records.length} {card.records.length === 1 ? 'record' : 'records'}
            </Typography>
          )}
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