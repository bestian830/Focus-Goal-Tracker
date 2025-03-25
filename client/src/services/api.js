import axios from 'axios';

// use environment variable or default value as base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

// create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // allow cross-domain requests to carry cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor
api.interceptors.request.use(
  (config) => {
    // add authentication token here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // handle unified errors, such as 401 unauthorized
    if (error.response && error.response.status === 401) {
      // handle unauthorized error, such as redirecting to login page
      console.log('Unauthorized, please log in again');
      // add redirect logic here
    }
    return Promise.reject(error);
  }
);

// wrap API methods
const apiService = {
  // authentication related
  auth: {
    register: (userData) => api.post('/api/auth/register', userData),
    login: (credentials) => api.post('/api/auth/login', credentials),
    logout: () => api.post('/api/auth/logout'),
    getCurrentUser: (userId) => api.get(`/api/auth/me/${userId}`),
    createTempUser: (data) => api.post('/api/temp-users', data),
  },
  
  // user related
  users: {
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (data) => api.put('/api/users/profile', data),
    changePassword: (data) => api.put('/api/users/password', data),
    deleteAccount: () => api.delete('/api/users/account'),
  },
  
  // temporary user related
  tempUsers: {
    delete: (tempId) => api.delete(`/api/temp-users/${tempId}`),
  },
  
  // goal related
  goals: {
    getAll: (userId) => api.get(`/api/goals/user/${userId}`),
    getById: (id) => api.get(`/api/goals/detail/${id}`),
    create: (goalData) => api.post('/api/goals', goalData),
    update: (id, goalData) => api.put(`/api/goals/${id}`, goalData),
    delete: (id) => api.delete(`/api/goals/${id}`),
    updateStatus: (id, status) => api.put(`/api/goals/${id}/status`, { status }),
    addCheckpoint: (id, checkpoint) => api.post(`/api/goals/${id}/checkpoints`, checkpoint),
    updateDeclaration: (id, declaration) => api.put(`/api/goals/${id}/declaration`, declaration),
  },
  
  // progress related
  progress: {
    getAll: (goalId) => api.get(`/api/progress?goalId=${goalId}`),
    getById: (id) => api.get(`/api/progress/${id}`),
    create: (progressData) => api.post('/api/progress', progressData),
    addRecord: (id, record) => api.post(`/api/progress/${id}/records`, record),
    updateCheckpoint: (id, checkpointId, status) => 
      api.put(`/api/progress/${id}/checkpoints/${checkpointId}`, { status }),
    getSummary: (goalId, startDate, endDate) => 
      api.get(`/api/progress/summary?goalId=${goalId}&startDate=${startDate}&endDate=${endDate}`),
  },
};

export default apiService; 