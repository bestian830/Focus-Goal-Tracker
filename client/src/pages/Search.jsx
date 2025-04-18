import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  Divider,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import apiService from '../services/api';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Form state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('criteria') || '');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Results state
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  
  // Fallback data
  const [allGoals, setAllGoals] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Load search from URL params when component mounts
  useEffect(() => {
    const criteria = searchParams.get('criteria');
    const start = searchParams.get('createdStartDate');
    const end = searchParams.get('createdEndDate');
    
    if (criteria || start || end) {
      if (criteria) setSearchQuery(criteria);
      if (start) setStartDate(new Date(start));
      if (end) setEndDate(new Date(end));
      
      // Perform search with URL parameters
      handleSearch(criteria, start, end);
    }
    
    // Fetch all goals as fallback
    fetchAllGoals();
  }, []);
  
  const fetchAllGoals = async () => {
    try {
      const response = await apiService.goals.getAll();
      if (response.data) {
        setAllGoals(Array.isArray(response.data) ? response.data : (response.data.data || []));
      }
    } catch (error) {
      console.error('Failed to fetch all goals as fallback:', error);
    }
  };
  
  const performLocalSearch = (query, startDateStr, endDateStr) => {
    let filtered = [...allGoals];
    
    // Filter by title/query
    if (query) {
      filtered = filtered.filter(goal => 
        goal.title && goal.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Filter by start date
    if (startDateStr) {
      const start = new Date(startDateStr);
      filtered = filtered.filter(goal => {
        const createdAt = goal.createdAt ? new Date(goal.createdAt) : null;
        return createdAt && createdAt >= start;
      });
    }
    
    // Filter by end date
    if (endDateStr) {
      const end = new Date(endDateStr);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(goal => {
        const createdAt = goal.createdAt ? new Date(goal.createdAt) : null;
        return createdAt && createdAt <= end;
      });
    }
    
    return filtered;
  };
  
  const handleSearch = async (query = searchQuery, start = startDate, end = endDate) => {
    if (!query && !start && !end) return;
    
    // Update URL with search parameters
    const params = {};
    if (query) params.criteria = query;
    if (start) params.createdStartDate = start instanceof Date ? start.toISOString() : start;
    if (end) params.createdEndDate = end instanceof Date ? end.toISOString() : end;
    setSearchParams(params);
    
    setLoading(true);
    setError(null);
    setUsingFallback(false);
    
    try {
      const dateRange = {};
      if (start) dateRange.startDate = start instanceof Date ? start.toISOString() : start;
      if (end) dateRange.endDate = end instanceof Date ? end.toISOString() : end;
      
      // Try to use API search first
      const response = await apiService.goals.search(query, dateRange);
      setSearchResults(response.data);
      setSearched(true);
    } catch (error) {
      console.error('Search API failed, switching to local filtering:', error);
      
      // Use local filtering as fallback
      setUsingFallback(true);
      
      const startStr = start instanceof Date ? start.toISOString() : start;
      const endStr = end instanceof Date ? end.toISOString() : end;
      
      const filteredResults = performLocalSearch(query, startStr, endStr);
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setError('No matching goals found. Try different search criteria.');
      } else {
        setError('Using local search results due to API limitations.');
      }
      setShowError(true);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClear = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setSearchResults([]);
    setSearched(false);
    setSearchParams({});
    setError(null);
    setUsingFallback(false);
  };
  
  const viewGoalDetails = (goalId) => {
    navigate(`/goals/${goalId}`);
  };
  
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };
  
  const handleCloseError = () => {
    setShowError(false);
  };
  
  const navigateToHome = () => {
    navigate('/');
  };
  
  return (
    <Container>
      <Box pt={4} pb={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Search Goals
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<HomeIcon />} 
            onClick={navigateToHome}
          >
            Back to Home
          </Button>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box component="form" noValidate onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Search goals by title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  <strong>Search by Creation Date Range:</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Find goals created between specific dates
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Created After (Start Date)"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "Search goals created on or after this date"
                      }
                    }}
                    format="MM/dd/yyyy"
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Created Before (End Date)"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "Search goals created on or before this date"
                      }
                    }}
                    format="MM/dd/yyyy"
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button 
                  variant="contained" 
                  type="submit"
                  startIcon={<SearchIcon />}
                  disabled={loading}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        {usingFallback && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Using client-side filtering. Some search features may be limited.
          </Alert>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && searched && searchResults.length === 0 && (
          <Box sx={{ textAlign: 'center', my: 4, p: 3, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography variant="h6">No results found</Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              {(searchQuery || startDate || endDate) ? (
                <>
                  No goals match your search criteria. Try:
                  <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '8px' }}>
                    {searchQuery && <li>Using different keywords</li>}
                    {(startDate || endDate) && <li>Expanding the date range</li>}
                    <li>Clearing some filters</li>
                  </ul>
                </>
              ) : (
                'Please enter search terms or select a date range'
              )}
            </Typography>
          </Box>
        )}
        
        {!loading && searchResults.length > 0 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 1 }}>
              <Typography variant="h5">
                Search Results ({searchResults.length})
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                {startDate && endDate ? `Goals created between ${formatDate(startDate)} and ${formatDate(endDate)}` : 
                 startDate ? `Goals created since ${formatDate(startDate)}` : 
                 endDate ? `Goals created before ${formatDate(endDate)}` : ''}
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {searchResults.map((goal) => (
                <Grid item xs={12} md={6} lg={4} key={goal._id || goal.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {goal.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {goal.description || 'No description'}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Created:</strong> {formatDate(goal.createdAt)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Target:</strong> {formatDate(goal.targetDate)}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        endIcon={<ChevronRightIcon />}
                        onClick={() => viewGoalDetails(goal._id || goal.id)}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
      
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="info" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Search; 