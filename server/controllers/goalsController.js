import Goal from "../models/Goal.js";
import User from "../models/User.js";

/**
 * Get all goals for a specific user
 * 
 * @route GET /api/goals/:userId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`获取目标列表，用户ID: ${userId}`, {
      是临时ID: typeof userId === 'string' && userId.startsWith('temp_')
    });
    
    let userExists = false;
    let queryConditions = [];
    
    // 检查用户ID是否为临时用户ID (以temp_开头)
    if (userId && typeof userId === 'string' && userId.startsWith('temp_')) {
      console.log(`检测到临时用户ID: ${userId}，检查临时用户是否存在`);
      // 对于临时用户，使用TempUser模型查找
      const TempUser = await import("../models/TempUser.js").then(module => module.default);
      const tempUser = await TempUser.findOne({ tempId: userId });
      
      if (tempUser) {
        console.log(`临时用户存在: ${userId}`);
        userExists = true;
        
        // 临时用户情况下，查找是否有已注册用户关联了这个临时ID
        const registeredUser = await User.findOne({ tempId: userId });
        if (registeredUser) {
          console.log(`找到关联的注册用户: ${registeredUser._id}，将同时查询两个用户ID的目标`);
          queryConditions = [
            { userId: userId },
            { userId: registeredUser._id.toString() }
          ];
        } else {
          queryConditions = [{ userId: userId }];
        }
      } else {
        console.log(`临时用户不存在: ${userId}`);
      }
    } else {
      // 注册用户，使用User模型查找
      const user = await User.findById(userId);
      
      if (user) {
        console.log(`注册用户存在: ${userId}`);
        userExists = true;
        
        queryConditions = [{ userId: userId.toString() }];
        
        // 如果注册用户关联了临时用户ID，也查询与临时ID相关的目标
        if (user.tempId) {
          console.log(`注册用户关联了临时ID: ${user.tempId}，将同时查询两个ID的目标`);
          queryConditions.push({ userId: user.tempId });
        }
      }
    }
    
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found"
        }
      });
    }
    
    // 使用$or构建查询条件，同时查询多个可能的userId
    const query = queryConditions.length > 1 ? { $or: queryConditions } : queryConditions[0];
    console.log("查询条件:", JSON.stringify(query));
    
    // Find all goals for the user (based on current userId or previously linked tempId)
    const goals = await Goal.find(query).sort({ createdAt: -1 });
    
    console.log(`找到 ${goals.length} 个目标，用户ID: ${userId}`);
    
    res.status(200).json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch goals",
        details: error.message
      }
    });
  }
};

/**
 * Create a new goal
 * 
 * @route POST /api/goals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createGoal = async (req, res) => {
  try {
    const { 
      userId, 
      title, 
      description, 
      priority,
      motivation,
      targetDate,
      resources,
      dailyTasks,
      rewards,
      declaration, 
      checkpoints
    } = req.body;
    
    console.log(`===== 開始創建目標 =====`);
    console.log(`用戶ID: ${userId}, 標題: "${title}"`);
    console.log(`是否為臨時用戶ID: ${userId?.toString().startsWith('temp_') ? 'Yes' : 'No'}`);
    
    // Validate required fields
    if (!userId || !title || !description) {
      console.log(`創建目標失敗: 缺少必要字段`);
      return res.status(400).json({
        success: false,
        error: {
          message: "User ID, title, and description are required"
        }
      });
    }
    
    let user = null;
    let isTemporaryUser = false;
    
    // Check if user ID is a temporary user ID (starting with temp_)
    if (userId && userId.toString().startsWith('temp_')) {
      console.log(`檢測到臨時用戶ID: ${userId}`);
      isTemporaryUser = true;
      
      // For temporary users, use TempUser model to find
      try {
        const TempUser = await import("../models/TempUser.js").then(module => module.default);
        user = await TempUser.findOne({ tempId: userId });
      } catch (modelError) {
        console.error(`加載臨時用戶模型出錯:`, modelError);
        return res.status(500).json({
          success: false,
          error: {
            message: "Server error: Failed to load user model"
          }
        });
      }
      
      if (!user) {
        console.log(`找不到臨時用戶: ${userId}`);
        return res.status(404).json({
          success: false,
          error: {
            message: "Temporary user not found"
          }
        });
      }
      
      // Check if temporary user already has a goal (limit: 1)
      try {
        const existingGoals = await Goal.find({ userId: userId.toString() });
        console.log(`臨時用戶已有 ${existingGoals.length} 個目標`);
        
        if (existingGoals.length >= 1) {
          console.log(`臨時用戶目標數量已達上限: ${existingGoals.length}`);
          return res.status(400).json({
            success: false,
            error: {
              message: "Temporary users are limited to one active goal. Please register for a full account to create more goals."
            }
          });
        }
      } catch (findError) {
        console.error(`查詢現有目標時出錯:`, findError);
        return res.status(500).json({
          success: false,
          error: {
            message: "Server error: Failed to check existing goals"
          }
        });
      }
      
      console.log(`臨時用戶存在，開始創建目標`);
    } else {
      // Registered user, use User model to find
      try {
        user = await User.findById(userId);
      } catch (findError) {
        console.error(`查詢用戶時出錯:`, findError);
        return res.status(500).json({
          success: false,
          error: {
            message: "Server error: Failed to find user"
          }
        });
      }
      
      if (!user) {
        console.log(`找不到註冊用戶: ${userId}`);
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found"
          }
        });
      }
      
      // Check if registered user already has maximum allowed goals (limit: 4 active goals)
      try {
        const activeGoals = await Goal.find({ 
          userId: userId.toString(),
          status: "active"
        });
        
        console.log(`註冊用戶已有 ${activeGoals.length} 個活躍目標`);
        
        if (activeGoals.length >= 4) {
          console.log(`註冊用戶活躍目標數量已達上限: ${activeGoals.length}`);
          return res.status(400).json({
            success: false,
            error: {
              message: "Regular users are limited to four active goals. Please complete or archive existing goals to create new ones."
            }
          });
        }
      } catch (findError) {
        console.error(`查詢活躍目標時出錯:`, findError);
        return res.status(500).json({
          success: false,
          error: {
            message: "Server error: Failed to check active goals"
          }
        });
      }
    }
    
    // Create goal object
    const goalData = {
      userId: userId.toString(),
      title,
      description,
      priority: priority || "Medium",
      status: "active",
      // 添加新字段
      motivation: motivation || "",
      targetDate: targetDate || null,
      resources: resources || [],
      dailyTasks: dailyTasks || [],
      rewards: rewards || []
    };
    
    // 添加可选字段
    if (declaration) goalData.declaration = declaration;
    if (checkpoints) goalData.checkpoints = checkpoints;
    
    // 初始化dailyCards数组
    goalData.dailyCards = [];
    
    // 记录创建的目标数据
    console.log("開始創建目標，數據:", {
      userId: goalData.userId,
      title: goalData.title,
      hasMotivation: !!goalData.motivation,
      hasTargetDate: !!goalData.targetDate,
      resourcesCount: goalData.resources.length,
      dailyTasksCount: goalData.dailyTasks.length,
      rewardsCount: goalData.rewards.length,
      userType: isTemporaryUser ? "臨時用戶" : "註冊用戶"
    });
    
    // Create new goal
    let goal;
    try {
      goal = await Goal.create(goalData);
      console.log(`目標創建成功，ID: ${goal._id}`);
    } catch (createError) {
      console.error(`創建目標時出錯:`, createError);
      
      // 檢查是否是重複鍵錯誤
      if (createError.name === 'MongoServerError' && createError.code === 11000) {
        console.log(`發生重複鍵錯誤:`, createError.keyValue);
        return res.status(400).json({
          success: false,
          error: {
            message: "A goal with this title already exists. Please use a different title.",
            code: "DUPLICATE_KEY",
            details: createError.keyValue
          }
        });
      }
      
      // 其他錯誤
      return res.status(500).json({
        success: false,
        error: {
          message: "Failed to create goal",
          details: createError.message
        }
      });
    }
    
    res.status(201).json({
      success: true,
      data: goal
    });
    
    console.log(`===== 目標創建完成 =====`);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create goal",
        details: error.message
      }
    });
  }
};

/**
 * Get a specific goal by ID
 * 
 * @route GET /api/goals/detail/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const goal = await Goal.findById(id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Goal not found"
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch goal",
        details: error.message
      }
    });
  }
};

/**
 * Update a goal
 * 
 * @route PUT /api/goals/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`處理目標更新請求, ID: ${id}`, {
      requestBody: JSON.stringify(req.body, null, 2)
    });
    
    const { 
      title, 
      description, 
      priority,
      motivation,
      targetDate,
      resources,
      dailyTasks,
      rewards,
      declaration, 
      checkpoints, 
      status,
      dailyCards
    } = req.body;
    
    // 記錄日期更新，這對診斷很重要
    if (targetDate) {
      console.log(`目標日期更新請求: ${targetDate}`, {
        日期類型: typeof targetDate,
        是否有效: !isNaN(new Date(targetDate).getTime()),
        解析結果: new Date(targetDate)
      });
    }
    
    // Find goal
    const goal = await Goal.findById(id);
    
    if (!goal) {
      console.log(`目標 ${id} 未找到`);
      return res.status(404).json({
        success: false,
        error: {
          message: "Goal not found"
        }
      });
    }
    
    console.log(`找到要更新的目標: ${goal.title}`);
    
    // Update fields
    if (title) goal.title = title;
    if (description) goal.description = description;
    if (priority) goal.priority = priority;
    if (targetDate) goal.targetDate = targetDate;
    if (declaration) goal.declaration = declaration;
    if (checkpoints) goal.checkpoints = checkpoints;
    if (status) goal.status = status;
    
    // 更新新字段
    if (motivation !== undefined) goal.motivation = motivation;
    if (resources) goal.resources = resources;
    if (dailyTasks) goal.dailyTasks = dailyTasks;
    if (rewards) goal.rewards = rewards;
    if (dailyCards) goal.dailyCards = dailyCards;
    
    // Save updated goal
    await goal.save();
    console.log(`目標更新成功, ID: ${id}`);
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update goal",
        details: error.message
      }
    });
  }
};

/**
 * Delete a goal
 * 
 * @route DELETE /api/goals/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const goal = await Goal.findById(id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Goal not found"
        }
      });
    }
    
    await goal.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to delete goal",
        details: error.message
      }
    });
  }
};

/**
 * Update goal status
 * 
 * @route PUT /api/goals/:id/status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateGoalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status value
    const validStatuses = ["active", "completed", "abandoned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid status value. Must be one of: active, completed, abandoned"
        }
      });
    }
    
    const goal = await Goal.findById(id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Goal not found"
        }
      });
    }
    
    // Update status
    goal.status = status;
    
    // If completed, set completedAt
    if (status === "completed") {
      goal.completedAt = new Date();
    } else {
      goal.completedAt = undefined; // Remove completedAt if not completed
    }
    
    await goal.save();
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error("Error updating goal status:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update goal status",
        details: error.message
      }
    });
  }
};

/**
 * Add or update a daily card for a goal
 * 
 * @route POST /api/goals/:id/daily-card
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addOrUpdateDailyCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, dailyTask, dailyReward, completed, links, records, taskCompletions } = req.body;
    
    // Find goal
    const goal = await Goal.findById(id);
    
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Goal not found"
        }
      });
    }
    
    // Convert date string to Date object
    const cardDate = date ? new Date(date) : new Date();
    
    console.log('處理日卡請求:', {
      目標ID: id,
      請求日期: date,
      解析日期: cardDate,
      現有卡片數量: goal.dailyCards.length
    });
    
    // 改進日期比較邏輯，更準確地處理日期比較
    const existingCardIndex = goal.dailyCards.findIndex(card => {
      // 轉換兩個日期為本地日期字符串 YYYY-MM-DD 進行比較
      const cardLocalDate = new Date(card.date);
      const targetLocalDate = new Date(cardDate);
      
      const cardDateStr = `${cardLocalDate.getFullYear()}-${String(cardLocalDate.getMonth() + 1).padStart(2, '0')}-${String(cardLocalDate.getDate()).padStart(2, '0')}`;
      const targetDateStr = `${targetLocalDate.getFullYear()}-${String(targetLocalDate.getMonth() + 1).padStart(2, '0')}-${String(targetLocalDate.getDate()).padStart(2, '0')}`;
      
      console.log('日期比較:', {
        卡片日期: cardDateStr,
        目標日期: targetDateStr,
        相等: cardDateStr === targetDateStr
      });
      
      return cardDateStr === targetDateStr;
    });
    
    console.log('日期比較結果:', {
      找到現有卡片: existingCardIndex !== -1,
      索引: existingCardIndex
    });
    
    if (existingCardIndex !== -1) {
      // Update existing card
      if (dailyTask) goal.dailyCards[existingCardIndex].dailyTask = dailyTask;
      if (dailyReward) goal.dailyCards[existingCardIndex].dailyReward = dailyReward;
      
      if (completed) {
        if (!goal.dailyCards[existingCardIndex].completed) {
          goal.dailyCards[existingCardIndex].completed = {};
        }
        if (completed.dailyTask !== undefined) {
          goal.dailyCards[existingCardIndex].completed.dailyTask = completed.dailyTask;
        }
        if (completed.dailyReward !== undefined) {
          goal.dailyCards[existingCardIndex].completed.dailyReward = completed.dailyReward;
        }
      }
      
      // 处理任务完成状态
      if (taskCompletions) {
        console.log('更新任务完成状态:', {
          原状态: goal.dailyCards[existingCardIndex].taskCompletions || {},
          新状态: taskCompletions
        });
        
        // 完全替换任务完成状态对象，而不是浅合并
        // 使用深拷贝避免引用问题
        goal.dailyCards[existingCardIndex].taskCompletions = JSON.parse(JSON.stringify(taskCompletions));
        
        console.log('更新后的任务完成状态:', goal.dailyCards[existingCardIndex].taskCompletions);
      }
      
      // 處理記錄（records）字段
      if (records) {
        goal.dailyCards[existingCardIndex].records = records;
      }
      
      if (links && links.length > 0) {
        if (!goal.dailyCards[existingCardIndex].links) {
          goal.dailyCards[existingCardIndex].links = [];
        }
        goal.dailyCards[existingCardIndex].links.push(...links);
      }
    } else {
      // Create new card
      const newCard = {
        date: cardDate,
        dailyTask: dailyTask || goal.currentSettings?.dailyTask || '',
        dailyReward: dailyReward || goal.currentSettings?.dailyReward || '',
        completed: completed || { dailyTask: false, dailyReward: false },
        records: records || [],
        links: links || [],
        // 使用深拷贝创建任务完成状态对象，避免引用问题
        taskCompletions: taskCompletions ? JSON.parse(JSON.stringify(taskCompletions)) : {}
      };
      
      console.log('创建新卡片:', {
        日期: cardDate,
        任务完成状态: newCard.taskCompletions
      });
      
      goal.dailyCards.push(newCard);
    }
    
    // Save updated goal
    await goal.save();
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error("Error adding/updating daily card:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to add/update daily card",
        details: error.message
      }
    });
  }
};

export {
  getAllGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  updateGoalStatus,
  addOrUpdateDailyCard
}; 