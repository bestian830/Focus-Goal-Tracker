import React from 'react';
import { Box, Typography, Checkbox, FormControlLabel } from '@mui/material';

/**
 * DailyReward component displays the daily reward for a goal with a checkbox to mark as claimed
 * @param {Object} props
 * @param {string} props.reward - The daily reward text
 * @param {boolean} props.claimed - Whether the reward has been claimed
 * @param {Function} props.onClaimedChange - Callback for when claimed status changes
 * @param {boolean} props.disabled - Whether the checkbox should be disabled
 */
export default function DailyReward({ reward, claimed = false, onClaimedChange, disabled = false }) {
  return (
    <Box className="daily-reward" sx={{ my: 2, p: 1, borderTop: '1px solid #eee' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={claimed}
            onChange={(e) => onClaimedChange && onClaimedChange(e.target.checked)}
            disabled={disabled}
          />
        }
        label={
          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" component="span" sx={{ mr: 1 }}>
              Daily Reward:
            </Typography>
            <Typography 
              variant="body1" 
              component="span" 
              fontWeight={500}
              sx={{ 
                color: claimed ? 'success.main' : 'text.primary',
                textDecoration: claimed ? 'line-through' : 'none'
              }}
            >
              {reward || 'No reward set'}
            </Typography>
          </Box>
        }
        sx={{ display: 'flex', mr: 0 }}
      />
    </Box>
  );
}
