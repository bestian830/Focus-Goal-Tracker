import axios from "axios";

// 設置後端 API URL，生產環境中強制使用部署的 URL
const PRODUCTION_API_URL = "https://focusappdeploy-backend.onrender.com";
const DEVELOPMENT_API_URL = "http://localhost:5050";

// 根據環境選擇 API URL
const API_URL =
  import.meta.env.MODE === "production"
    ? PRODUCTION_API_URL
    : import.meta.env.VITE_API_URL || DEVELOPMENT_API_URL;

// 添加調試信息，幫助診斷連接問題
console.log("=== API 配置信息 ===");
console.log("運行模式:", import.meta.env.MODE);
console.log("使用的 API URL:", API_URL);
console.log("====================");

// 創建 axios 實例
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允許跨域請求攜帶 cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 記錄完整的請求 URL，便於調試
    console.log(`發送請求到: ${config.baseURL}${config.url}`);
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
    // 處理統一錯誤
    console.error("API 錯誤:", {
      message: error.message,
      url: error.config ? `${error.config.baseURL}${error.config.url}` : "未知",
      status: error.response ? error.response.status : "無響應",
      data: error.response ? error.response.data : "無數據",
    });

    if (error.response && error.response.status === 401) {
      // 處理未授權錯誤
      console.log("未授權，請重新登錄");
    }

    return Promise.reject(error);
  }
);

// 封裝 API 方法
const apiService = {
  // 認證相關
  auth: {
    register: (userData) => api.post("/api/auth/register", userData),
    login: (credentials) => api.post("/api/auth/login", credentials),
    logout: () => api.post("/api/auth/logout"),
    getCurrentUser: (userId) => api.get(`/api/auth/me/${userId}`),
    createTempUser: (data) => api.post("/api/temp-users", data),
  },

  // 用戶相關
  users: {
    getProfile: () => api.get("/api/users/profile"),
    updateProfile: (data) => api.put("/api/users/profile", data),
    changePassword: (data) => api.put("/api/users/password", data),
    deleteAccount: () => api.delete("/api/users/account"),
  },

  // 臨時用戶相關
  tempUsers: {
    delete: (tempId) => api.delete(`/api/temp-users/${tempId}`),
  },

  // 目標相關
  goals: {
    getAll: (userId) => api.get(`/api/goals/user/${userId}`),
    getById: (id) => api.get(`/api/goals/detail/${id}`),
    create: (goalData) => api.post("/api/goals", goalData),
    update: (id, goalData) => api.put(`/api/goals/${id}`, goalData),
    delete: (id) => api.delete(`/api/goals/${id}`),
    updateStatus: (id, status) =>
      api.put(`/api/goals/${id}/status`, { status }),
    addCheckpoint: (id, checkpoint) =>
      api.post(`/api/goals/${id}/checkpoints`, checkpoint),
    updateDeclaration: (id, declaration) =>
      api.put(`/api/goals/${id}/declaration`, declaration),
  },

  // 進度相關
  progress: {
    getAll: (goalId) => api.get(`/api/progress?goalId=${goalId}`),
    getById: (id) => api.get(`/api/progress/${id}`),
    create: (progressData) => api.post("/api/progress", progressData),
    addRecord: (id, record) => api.post(`/api/progress/${id}/records`, record),
    updateCheckpoint: (id, checkpointId, status) =>
      api.put(`/api/progress/${id}/checkpoints/${checkpointId}`, { status }),
    getSummary: (goalId, startDate, endDate) =>
      api.get(
        `/api/progress/summary?goalId=${goalId}&startDate=${startDate}&endDate=${endDate}`
      ),
  },
};

export default apiService;
