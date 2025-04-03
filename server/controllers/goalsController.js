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
    
    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found"
        }
      });
    }
    
    // Find all goals for the user
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    
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
      targetDate, 
      declaration, 
      checkpoints,
      details,
      currentSettings
    } = req.body;
    
    // Validate required fields
    if (!userId || !title || !description) {
      return res.status(400).json({
        success: false,
        error: {
          message: "User ID, title, and description are required"
        }
      });
    }
    
    let user = null;
    // 检查用户ID是否为临时用户ID (以temp_开头)
    if (userId && userId.toString().startsWith('temp_')) {
      console.log(`创建目标：检测到临时用户ID: ${userId}`);
      // 对于临时用户，使用TempUser模型查找
      const TempUser = await import("../models/TempUser.js").then(module => module.default);
      user = await TempUser.findOne({ tempId: userId });
      
      if (!user) {
        console.log(`临时用户不存在: ${userId}`);
        return res.status(404).json({
          success: false,
          error: {
            message: "Temporary user not found"
          }
        });
      }
      
      console.log(`临时用户存在，继续创建目标`);
    } else {
      // 注册用户，使用User模型查找
      user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found"
          }
        });
      }
    }
    
    // Create goal object
    const goalData = {
      userId,
      title,
      description,
      priority: priority || "Medium",
      status: "active"
    };
    
    // Add optional fields if provided
    if (targetDate) goalData.targetDate = targetDate;
    if (declaration) goalData.declaration = declaration;
    if (checkpoints) goalData.checkpoints = checkpoints;
    
    // Add new fields from the updated schema
    if (details) goalData.details = details;
    if (currentSettings) goalData.currentSettings = currentSettings;
    
    // Initialize dailyCards with an empty array
    goalData.dailyCards = [];
    
    // 详细记录要创建的目标数据
    console.log("创建目标数据:", {
      userId: goalData.userId,
      title: goalData.title,
      hasDetails: !!goalData.details,
      hasSettings: !!goalData.currentSettings
    });
    
    // Create new goal
    const goal = await Goal.create(goalData);
    
    console.log(`成功创建目标，ID: ${goal._id}`);
    
    res.status(201).json({
      success: true,
      data: goal
    });
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
    const { 
      title, 
      description, 
      priority, 
      targetDate, 
      declaration, 
      checkpoints, 
      status,
      details,
      currentSettings,
      dailyCards
    } = req.body;
    
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
    
    // Update fields
    if (title) goal.title = title;
    if (description) goal.description = description;
    if (priority) goal.priority = priority;
    if (targetDate) goal.targetDate = targetDate;
    if (declaration) goal.declaration = declaration;
    if (checkpoints) goal.checkpoints = checkpoints;
    if (status) goal.status = status;
    
    // Update new fields
    if (details) goal.details = details;
    if (currentSettings) goal.currentSettings = currentSettings;
    if (dailyCards) goal.dailyCards = dailyCards;
    
    // Save updated goal
    await goal.save();
    
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
    const { date, dailyTask, dailyReward, completed, links } = req.body;
    
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
    
    // Check if a card for this date already exists
    const existingCardIndex = goal.dailyCards.findIndex(card => 
      new Date(card.date).toDateString() === cardDate.toDateString()
    );
    
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
        links: links || []
      };
      
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