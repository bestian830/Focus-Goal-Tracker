import axios from "axios";

// set backend API URL
const PRODUCTION_API_URL = "https://focusappdeploy-backend.onrender.com";
const DEVELOPMENT_API_URL = "http://localhost:5050";

// choose API URL based on environment - optimize environment detection logic
const isProduction =
  import.meta.env.PROD === true || import.meta.env.MODE === "production";
const API_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

// output configuration information, help diagnose connection issues
console.log("=== API configuration information ===");
console.log("Running mode:", import.meta.env.MODE);
console.log("Is production environment:", import.meta.env.PROD);
console.log("Environment detection result:", isProduction ? "Production environment" : "Development environment");
console.log("Used API URL:", API_URL);
console.log("====================");

// create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // allow cross-domain requests to carry cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// request interceptor
api.interceptors.request.use(
  (config) => {
    // record the complete request URL, helpful for debugging
    console.log(`Sending request to: ${config.baseURL}${config.url}`);

    // no longer use X-User-Id header, rely on JWT cookie for authentication
    // JWT cookie will be automatically attached to requests because withCredentials: true is set

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
    // handle network errors
    if (error.code === "ERR_NETWORK") {
      console.error("Network connection error:", {
        message: error.message,
        url: error.config
          ? `${error.config.baseURL}${error.config.url}`
          : "Unknown",
        baseURL: API_URL,
        headers: error.config ? error.config.headers : "Unknown",
      });

      // if the request is for profile, provide more specific error information
      if (
        error.config &&
        error.config.url &&
        error.config.url.includes("/api/users/profile")
      ) {
        console.error("Failed to get user data - unable to connect to API server. Possible reasons:");
        console.error("1. Backend service is not running");
        console.error("2. Incorrect API_URL configuration:", API_URL);
        console.error("3. Cross-domain request issue");
        console.error("4. Cookie not set correctly");

        // check authentication status
        const userId = localStorage.getItem("userId");
        const token = document.cookie.includes("token=");
        console.error("Authentication status check:", {
          hasUserId: !!userId,
          hasCookie: token,
        });
      }
    }
    // handle authorization errors
    else if (error.response && error.response.status === 401) {
      console.log("Unauthorized, please log in again");
      // clear local storage and redirect to login page
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    // handle other errors
    else {
      console.error("API error:", {
        message: error.message,
        url: error.config
          ? `${error.config.baseURL}${error.config.url}`
          : "Unknown",
        status: error.response ? error.response.status : "No response",
        data: error.response ? error.response.data : "No data",
      });
    }

    return Promise.reject(error);
  }
);

// health check method - confirm API connection
const checkApiHealth = async () => {
  try {
    console.log("Executing API health check...");
    const response = await api.get("/api/health");
    console.log("API connection is healthy:", response.data);
    return true;
  } catch (error) {
    console.error("API connection error:", error.message);
    console.log("Attempted API URL:", API_URL);
    return false;
  }
};

// initial health check
setTimeout(() => {
  checkApiHealth().then((isHealthy) => {
    if (!isHealthy && window.location.hostname !== "localhost") {
      console.warn("Warning: Unable to connect to backend API, please ensure the service is running properly.");
    }
  });
}, 1000);

// encapsulate API methods
const apiService = {
  // diagnostic method
  getDiagnostics: () => {
    return {
      apiUrl: API_URL,
      mode: import.meta.env.MODE,
      isProd: import.meta.env.PROD,
      allowedOrigins: [
        "http://localhost:5173",
        "https://focusappdeploy-frontend.onrender.com",
      ],
    };
  },

  // health check
  healthCheck: checkApiHealth,

  // authentication related
  auth: {
    register: (userData) => {
      console.log(`發送註冊請求，數據:`, {
        ...userData,
        password: userData.password ? '******' : undefined
      });
      return api.post("/api/auth/register", userData)
        .then(response => {
          console.log(`註冊成功，響應:`, response.data);
          return response;
        })
        .catch(error => {
          console.error(`註冊失敗:`, error.response ? error.response.data : error.message);
          throw error;
        });
    },
    login: (credentials) => api.post("/api/auth/login", credentials),
    logout: () => api.post("/api/auth/logout"),
    getCurrentUser: (userId) => api.get(`/api/auth/me/${userId}`),
    createTempUser: (data = {}) => api.post("/api/temp-users", data),
  },

  // user related
  users: {
    getProfile: () => {
      console.log("Calling getProfile method, API_URL:", API_URL);
      return api.get("/api/users/profile");
    },
    updateProfile: (data) => api.put("/api/users/profile", data),
    changePassword: (data) => api.put("/api/users/password", data),
    deleteAccount: () => api.delete("/api/users/account"),
  },

  // temporary user related
  tempUsers: {
    delete: (tempId) => api.delete(`/api/temp-users/${tempId}`),
  },

  // goal related
  goals: {
    getAll: (userId) => api.get(`/api/goals/user/${userId}`),
    getUserGoals: (userId) => {
      console.log(`API调用getUserGoals，用户ID: ${userId}`, { isTemporary: userId && userId.toString().startsWith('temp_') });
      return api.get(`/api/goals/${userId}`)
        .catch(error => {
          console.error(`getUserGoals错误，用户ID: ${userId}`, error);
          throw error;
        });
    },
    getById: (id) => api.get(`/api/goals/detail/${id}`),
    create: (goalData) => api.post("/api/goals", goalData),
    createGoal: (goalData) => {
      // 确保goalData包含有效的userId
      if (!goalData.userId) {
        console.error("创建目标错误: 缺少userId");
        return Promise.reject(new Error("目标数据缺少用户ID"));
      }
      
      const isTemporary = typeof goalData.userId === 'string' && goalData.userId.startsWith('temp_');
      console.log(`调用createGoal API，数据:`, {
        ...goalData,
        userId: goalData.userId,
        isTemporaryUser: isTemporary
      });
      
      return api.post("/api/goals", goalData)
        .then(response => {
          console.log(`创建目标成功，响应:`, response.data);
          return response;
        })
        .catch(error => {
          console.error(`创建目标失败:`, {
            error: error.response ? error.response.data : error.message,
            status: error.response ? error.response.status : '未知',
            userId: goalData.userId,
            isTemporaryUser: isTemporary
          });
          throw error;
        });
    },
    update: (id, goalData) => {
      console.log(`[API] 更新目標請求，ID: ${id}，數據:`, goalData);
      
      // 特別檢查是否包含目標日期欄位，這個欄位常見問題
      if (goalData.targetDate) {
        console.log(`[API] 目標日期更新檢查:`, {
          原始值: goalData.targetDate,
          類型: typeof goalData.targetDate,
          是日期對象: goalData.targetDate instanceof Date,
          ISO字符串: goalData.targetDate instanceof Date ? goalData.targetDate.toISOString() : goalData.targetDate
        });
      }
      
      return api.put(`/api/goals/${id}`, goalData)
        .then(response => {
          console.log(`[API] 目標更新成功，ID: ${id}`, response.data);
          return response;
        })
        .catch(error => {
          console.error(`[API] 目標更新失敗，ID: ${id}`, error);
          console.error(`[API] 錯誤詳情:`, {
            訊息: error.message,
            狀態: error.response?.status,
            響應: error.response?.data
          });
          throw error;
        });
    },
    delete: (id) => api.delete(`/api/goals/${id}`),
    updateStatus: (id, status) =>
      api.put(`/api/goals/${id}/status`, { status }),
    addCheckpoint: (id, checkpoint) =>
      api.post(`/api/goals/${id}/checkpoints`, checkpoint),
    addOrUpdateDailyCard: (id, cardData) =>
      api.post(`/api/goals/${id}/daily-card`, cardData),
  },

  // progress related
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
