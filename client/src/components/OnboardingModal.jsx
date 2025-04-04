import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GoalSettingGuide from './GoalSettingGuide/GoalSettingGuide';
import apiService from '../services/api';

/**
 * User onboarding modal
 * Displays goal setting guide for new or temporary users
 */
const OnboardingModal = ({ open, onClose, userId, isGuest, onComplete }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle goal submission completion
  const handleGoalSubmit = async (goalData) => {
    setSubmitting(true);
    setError('');

    try {
      // Log current user info
      console.log("OnboardingModal - Processing goal submission", { userId, isGuest });

      // Ensure goalData is valid
      if (!goalData || typeof goalData !== 'object') {
        console.error("Invalid goal data:", goalData);
        throw new Error("Invalid goal data");
      }

      // Check temporary user ID
      let finalUserId = userId;
      if (isGuest) {
        // Get from localStorage to ensure latest
        const tempIdFromStorage = localStorage.getItem("tempId");
        console.log("Temporary user ID from localStorage:", tempIdFromStorage);
        
        // If the passed userId differs from localStorage, use localStorage
        if (tempIdFromStorage && tempIdFromStorage.startsWith('temp_') && 
            (!userId || userId !== tempIdFromStorage)) {
          console.log(`Using tempId from localStorage instead of passed userId: ${tempIdFromStorage} instead of ${userId}`);
          finalUserId = tempIdFromStorage;
        }
      }

      // Ensure valid userId
      if (!finalUserId) {
        console.error("Unable to determine user ID, cannot create goal");
        throw new Error("Unable to determine user ID. Please try logging in again.");
      }

      // Set userId based on user type
      const finalGoalData = {
        ...goalData,
        userId: finalUserId,
      };

      console.log("Preparing goal data for submission:", {
        userId: finalGoalData.userId,
        title: finalGoalData.title,
        description: finalGoalData.description,
        targetDate: finalGoalData.targetDate,
        hasDetails: !!finalGoalData.details,
        hasSettings: !!finalGoalData.currentSettings
      });

      // Create new goal
      let response;
      if (isGuest && finalUserId && finalUserId.toString().startsWith('temp_')) {
        console.log("Temporary user detected, using tempUsers API...");
        try {
          // Try using temporary user's dedicated API
          response = await apiService.goals.createGoal(finalGoalData);
          console.log("Temporary user goal creation response:", response);
        } catch (tempError) {
          console.error("Temporary user API call failed:", tempError);
          throw tempError;
        }
      } else {
        // Regular registered user
        response = await apiService.goals.createGoal(finalGoalData);
      }

      // Check if response is valid
      if (!response || !response.data) {
        console.error("API returned invalid response:", response);
        throw new Error("Server returned invalid response");
      }

      if (response.data && response.data.success) {
        console.log("Goal created successfully:", response.data);
        // Notify parent component after successful goal creation
        onComplete(response.data.data);
      } else {
        console.error("API returned success but response format unexpected:", response);
        setError('Error creating goal. API response format incorrect.');
      }
    } catch (err) {
      console.error('Error creating goal:', err);
      
      // Provide more detailed error message
      let errorMessage = 'Error creating goal. Please try again later.';
      
      // Handle specific error cases
      if (err.response) {
        console.error('Error response:', err.response.data);
        
        // Check for duplicate key error
        if (err.response.data && err.response.data.error && 
            (err.response.data.error.includes('duplicate key') || 
             err.response.data.error.includes('E11000'))) {
          errorMessage = 'You already have a goal with this title. Please use a different title.';
        } else {
          errorMessage = err.response.data?.error?.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
        
        // Additional check for duplicate key in message
        if (err.message.includes('duplicate key') || err.message.includes('E11000')) {
          errorMessage = 'You already have a goal with this title. Please use a different title.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="onboarding-dialog-title"
    >
      <DialogTitle id="onboarding-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="div">
            {isGuest ? 'Welcome to Focus' : 'Create Your First Goal'}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <GoalSettingGuide 
          onComplete={handleGoalSubmit} 
          isSubmitting={submitting}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal; 