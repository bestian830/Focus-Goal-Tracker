import axios from 'axios';

// 定義獲取 API URL 的多種方式
const getApiUrl = () => {
  // 首先直接使用硬編碼的生產環境 URL
  const productionUrl = 'https://focusappdeploy-backend.onrender.com';
  
  // 記錄所有可能的來源
  const sources = {
    hardcoded: productionUrl,
    importMeta: import.meta.env.VITE_API_URL,
    processEnv: typeof process !== 'undefined' && process.env && process.env.VITE_API_URL,
    windowEnv: window.ENV && window.ENV.VITE_API_URL
  };
  
  console.log('API URL sources:', sources);
  
  // 在生產環境中優先使用硬編碼的 URL
  if (import.meta.env.MODE === 'production') {
    console.log('生產環境：使用硬編碼的後端URL');
    return productionUrl;
  }
  
  // 在開發環境中按優先順序使用配置的 URL
  // 按優先順序返回第一個有效的 URL
  return sources.importMeta || sources.processEnv || sources.windowEnv || sources.hardcoded;
};

// 獲取 API URL
const API_URL = getApiUrl();

// 添加偵錯輸出，查看實際使用的 API URL
console.log("=== API CONFIGURATION ===");
console.log("Final API URL being used:", API_URL);
console.log("Environment:", import.meta.env.MODE);
console.log("Window ENV:", window.ENV);
console.log("========================");

// create axios instance with CORS credentials
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
    // Log the full URL of each request for debugging
    console.log(`Making request to: ${config.baseURL}${config.url}`);
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
    } else {
      // Log detailed error information for debugging
      console.error('API Error:', {
        message: error.message,
        url: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
        status: error.response ? error.response.status : 'no response',
        data: error.response ? error.response.data : 'no data'
      });
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