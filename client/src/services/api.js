import axios from 'axios';

// 添加調試日誌以了解環境變量設置
console.log("=== 環境變量調試信息 ===");
console.log("import.meta.env:", import.meta.env);
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("MODE:", import.meta.env.MODE);
console.log("======================");

// 根據環境選擇API URL
const API_URL = import.meta.env.MODE === 'production' 
  ? 'https://focusappdeploy-backend.onrender.com'  // 生產環境直接使用硬編碼URL
  : (import.meta.env.VITE_API_URL || 'http://localhost:5050');  // 開發環境使用環境變量或默認值

// 記錄最終使用的API URL
console.log("最終使用的API URL:", API_URL);

// 創建axios實例
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允許跨域請求攜帶cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 可以在這裡添加認證令牌等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 處理統一錯誤，如401未授權等
    if (error.response && error.response.status === 401) {
      // 處理未授權錯誤，如重定向到登錄頁
      console.log('未授權，請重新登錄');
      // 可以在這裡添加重定向邏輯
    }
    return Promise.reject(error);
  }
);

// 封裝API方法
const apiService = {
  // 認證相關
  auth: {
    register: (userData) => api.post('/api/auth/register', userData),
    login: (credentials) => api.post('/api/auth/login', credentials),
    logout: () => api.post('/api/auth/logout'),
    getCurrentUser: (userId) => api.get(`/api/auth/me/${userId}`),
    createTempUser: (data) => api.post('/api/temp-users', data),
  },
  
  // 用戶相關
  users: {
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (data) => api.put('/api/users/profile', data),
    changePassword: (data) => api.put('/api/users/password', data),
    deleteAccount: () => api.delete('/api/users/account'),
  },
  
  // 臨時用戶相關
  tempUsers: {
    delete: (tempId) => api.delete(`/api/temp-users/${tempId}`),
  },
  
  // 目標相關
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
  
  // 進度相關
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