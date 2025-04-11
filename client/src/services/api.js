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
      console.log(`register: sending registration request, data:`, {
        ...userData,
        password: userData.password ? '******' : undefined
      });
      return api.post("/api/auth/register", userData)
        .then(response => {
          console.log(`register: registration successful, response:`, response.data);
          return response;
        })
        .catch(error => {
          console.error(`register: registration failed, error:`, error.response ? error.response.data : error.message);
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
      // ensure goalData contains a valid userId
      if (!goalData.userId) {
        console.error("createGoal: missing userId");
        return Promise.reject(new Error("目标数据缺少用户ID"));
      }
      
      // ensure description field exists
      if (!goalData.description && goalData.title && goalData.motivation) {
        console.log("API layer: found missing description field, generating automatically");
        goalData.description = `I want to ${goalData.title}, because ${goalData.motivation}.`;
      }
      
      // ensure declaration field exists
      if (!goalData.declaration || !goalData.declaration.content) {
        console.log("API layer: found missing declaration field, generating declaration content automatically");
        
        // generate declaration content
        const generateDeclarationText = (data) => {
          const username = 'User';
          const formattedDate = data.targetDate ? new Date(data.targetDate).toLocaleDateString() : '未设置日期';
          const dailyTask = data.dailyTasks && data.dailyTasks.length > 0 ? data.dailyTasks[0] : 'daily commitment';
          const reward = data.rewards && data.rewards.length > 0 ? data.rewards[0] : 'appropriate reward';
          const resource = data.resources && data.resources.length > 0 ? data.resources[0] : 'necessary preparation';
          const motivation = data.motivation || data.description || 'this is a deeply meaningful pursuit for me';
          
          return `${data.title}

This goal isn't just another item on my list—it's something I genuinely want to achieve.

I'm stepping onto this path because ${motivation}. It's something deeply meaningful to me, a desire that comes straight from my heart.

I trust that I have what it takes, because I already have ${resource} in my hands—these are my sources of confidence and strength as I move forward.

I don't need to wait until I'm "fully ready." The best moment to start is right now. Next, I'll take my first step and let the momentum carry me onward.

I understand that as long as I commit to ${dailyTask} each day, little by little, I'll steadily move closer to the goal I'm eager to achieve.

Every time I complete my daily milestone, I'll reward myself with something small and meaningful: ${reward}.

I've set a deadline for myself: ${formattedDate}. I know there might be ups and downs along the way, but I deeply believe I have enough resources and strength to keep going.

Because the path is already beneath my feet—it's really not that complicated. All I need to do is stay focused and adjust my pace when needed ^^.`;
        };
        
        goalData.declaration = {
          content: generateDeclarationText(goalData),
          updatedAt: new Date()
        };
      }
      
      const isTemporary = typeof goalData.userId === 'string' && goalData.userId.startsWith('temp_');
      console.log(`calling createGoal API, data:`, {
        ...goalData,
        userId: goalData.userId,
        hasDescription: !!goalData.description,
        descriptionText: goalData.description ? `${goalData.description.substring(0, 50)}${goalData.description.length > 50 ? '...' : ''}` : null,
        descriptionLength: goalData.description ? goalData.description.length : 0,
        hasDeclaration: !!goalData.declaration,
        declarationLength: goalData.declaration ? goalData.declaration.content.length : 0,
        hasVisionImageUrl: !!goalData.visionImageUrl,
        visionImageUrlLength: goalData.visionImageUrl ? goalData.visionImageUrl.length : 0,
        visionImageUrlPreview: goalData.visionImageUrl ? `${goalData.visionImageUrl.substring(0, 50)}...` : null,
        isTemporaryUser: isTemporary
      });
      
      return api.post("/api/goals", goalData)
        .then(response => {
          console.log(`createGoal: goal created successfully, response:`, response.data);
          return response;
        })
        .catch(error => {
          console.error(`createGoal: goal creation failed, error:`, {
            error: error.response ? error.response.data : error.message,
            status: error.response ? error.response.status : 'unknown',
            userId: goalData.userId,
            isTemporaryUser: isTemporary
          });
          throw error;
        });
    },
    update: (id, goalData) => {
      console.log(`update: updating goal request, ID: ${id}, data:`, goalData);
      
      // check if targetDate field exists
      if (goalData.targetDate) {
        console.log(`update: targetDate field exists, checking value:`, {
          originalValue: goalData.targetDate,
          type: typeof goalData.targetDate,
          isDateObject: goalData.targetDate instanceof Date,
          isoString: goalData.targetDate instanceof Date ? goalData.targetDate.toISOString() : goalData.targetDate
        });
      }
      
      return api.put(`/api/goals/${id}`, goalData)
        .then(response => {
          console.log(`update: goal updated successfully, ID: ${id}`, response.data);
          return response;
        })
        .catch(error => {
          console.error(`update: goal update failed, ID: ${id}`, error);
          console.error(`update: error details:`, {
            message: error.message,
            status: error.response?.status,
            response: error.response?.data
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
      api.post(`/api/goals/${id}/daily-card`, cardData)
        .then(response => {
          console.log('addOrUpdateDailyCard: daily card saved successfully, goalId:', id, 'response:', response.data);
          return response;
        })
        .catch(error => {
          console.error('addOrUpdateDailyCard: daily card save failed, goalId:', id, 'error:', error.message);
          console.error('addOrUpdateDailyCard: error details:', {
            goalId: id,
            error: error.message,
            status: error.response?.status,
            response: error.response?.data
          });
          throw error;
        }),
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

  // report related
  reports: {
    generate: (goalId, startDate, endDate) => {
      console.log('reports: calling generate report API, goalId:', goalId, 'time range:', startDate, 'to', endDate);
      return api.post(`/api/reports/${goalId}`, { 
        timeRange: {
          startDate: startDate,
          endDate: endDate
        }
      })
        .then(response => {
          console.log('reports: report generated successfully, response:', response);
          return response;
        })
        .catch(error => {
          console.error('reports: report generation failed, error:', error);
          throw error;
        });
    },
    getLatest: (goalId) => api.get(`/api/reports/${goalId}/latest`),
    rate: (feedbackId, rating) => api.post(`/api/reports/${feedbackId}/rate`, { rating })
  }
};

export default apiService;