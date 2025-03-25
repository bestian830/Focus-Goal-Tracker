import axios from "axios";

// 設置後端 API URL
const PRODUCTION_API_URL = "https://focusappdeploy-backend.onrender.com";
const DEVELOPMENT_API_URL = "http://localhost:5050";

// 根據環境選擇 API URL - 優化環境檢測邏輯
const isProduction =
  import.meta.env.PROD === true || import.meta.env.MODE === "production";
const API_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

// 輸出配置信息，幫助診斷連接問題
console.log("=== API 配置信息 ===");
console.log("運行模式:", import.meta.env.MODE);
console.log("是否生產環境:", import.meta.env.PROD);
console.log("環境檢測結果:", isProduction ? "生產環境" : "開發環境");
console.log("使用的 API URL:", API_URL);
console.log("====================");

// 創建 axios 實例
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允許跨域請求攜帶 cookie
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10秒
});

// request interceptor
api.interceptors.request.use(
  (config) => {
    // 記錄完整的請求 URL，便於調試
    console.log(`發送請求到: ${config.baseURL}${config.url}`);

    // 不再使用 X-User-Id 頭部，完全依賴 JWT cookie 進行認證
    // JWT cookie 會自動附加到請求中，因為已設置 withCredentials: true

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
    // 處理網絡錯誤
    if (error.code === "ERR_NETWORK") {
      console.error("網絡連接錯誤:", {
        message: error.message,
        url: error.config
          ? `${error.config.baseURL}${error.config.url}`
          : "未知",
        baseURL: API_URL,
        headers: error.config ? error.config.headers : "未知",
      });

      // 如果是profile請求，提供更具體的錯誤信息
      if (
        error.config &&
        error.config.url &&
        error.config.url.includes("/api/users/profile")
      ) {
        console.error("獲取用戶資料失敗 - 無法連接到API服務器。可能原因：");
        console.error("1. 後端服務未運行");
        console.error("2. API_URL配置不正確:", API_URL);
        console.error("3. 跨域請求問題");
        console.error("4. Cookie 未正確設置");

        // 檢查認證狀態
        const userId = localStorage.getItem("userId");
        const token = document.cookie.includes("token=");
        console.error("認證狀態檢查:", {
          hasUserId: !!userId,
          hasCookie: token,
        });
      }
    }
    // 處理授權錯誤
    else if (error.response && error.response.status === 401) {
      console.log("未授權，請重新登錄");
      // 清除本地存儲並重定向到登錄頁面
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    // 處理其他錯誤
    else {
      console.error("API 錯誤:", {
        message: error.message,
        url: error.config
          ? `${error.config.baseURL}${error.config.url}`
          : "未知",
        status: error.response ? error.response.status : "無響應",
        data: error.response ? error.response.data : "無數據",
      });
    }

    return Promise.reject(error);
  }
);

// 健康檢查方法 - 確認API連接
const checkApiHealth = async () => {
  try {
    console.log("執行API健康檢查...");
    const response = await api.get("/api/health");
    console.log("API連接正常:", response.data);
    return true;
  } catch (error) {
    console.error("API連接錯誤:", error.message);
    console.log("嘗試使用的API URL:", API_URL);
    return false;
  }
};

// 初始健康檢查
setTimeout(() => {
  checkApiHealth().then((isHealthy) => {
    if (!isHealthy && window.location.hostname !== "localhost") {
      console.warn("警告: 無法連接到後端API，請確認服務是否正常運行。");
    }
  });
}, 1000);

// 封裝 API 方法
const apiService = {
  // 診斷方法
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

  // 健康檢查
  healthCheck: checkApiHealth,

  // 認證相關
  auth: {
    register: (userData) => api.post("/api/auth/register", userData),
    login: (credentials) => api.post("/api/auth/login", credentials),
    logout: () => api.post("/api/auth/logout"),
    getCurrentUser: (userId) => api.get(`/api/auth/me/${userId}`),
    createTempUser: () => api.post("/api/temp-users"),
  },

  // 用戶相關
  users: {
    getProfile: () => {
      console.log("調用 getProfile 方法，API_URL:", API_URL);
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
