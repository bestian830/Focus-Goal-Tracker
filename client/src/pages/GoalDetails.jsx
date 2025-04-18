import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import apiService from '../services/api';

function GoalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchGoalDetails = async () => {
      try {
        setLoading(true);
        const response = await apiService.goals.getById(id);
        setGoal(response.data);
      } catch (err) {
        console.error('Error fetching goal details:', err);
        setError('Failed to load goal details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchGoalDetails();
    }
  }, [id]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleGoBack}>
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (!goal) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">Goal not found</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleGoBack}>
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container>
      <Box pt={4} pb={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Goal Details
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {goal.title}
            </Typography>
            <Chip 
              label={goal.status || 'pending'} 
              color={getStatusColor(goal.status)}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" paragraph>
                {goal.description || 'No description provided.'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Created:</strong> {formatDate(goal.createdAt)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Target Date:</strong> {formatDate(goal.targetDate)}
                </Typography>
              </Box>
            </Grid>
            
            {goal.checkpoints && goal.checkpoints.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Checkpoints
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {goal.checkpoints.map((checkpoint, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: index < goal.checkpoints.length - 1 ? 1.5 : 0 }}>
                      {checkpoint.completed ? (
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <RadioButtonUncheckedIcon color="disabled" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="body2">
                        {checkpoint.description || `Checkpoint ${index + 1}`}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
            
            {goal.rewards && goal.rewards.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Rewards
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {goal.rewards.map((reward, index) => (
                      <li key={index}>
                        <Typography variant="body2">{reward}</Typography>
                      </li>
                    ))}
                  </ul>
                </Paper>
              </Grid>
            )}
            
            {goal.resources && goal.resources.length > 0 && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Resources
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {goal.resources.map((resource, index) => (
                      <li key={index}>
                        <Typography variant="body2">{resource}</Typography>
                      </li>
                    ))}
                  </ul>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

export default GoalDetails; 