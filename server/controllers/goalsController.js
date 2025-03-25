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
    const { userId, title, description, priority, targetDate, declaration, checkpoints } = req.body;
    
    // Validate required fields
    if (!userId || !title || !description) {
      return res.status(400).json({
        success: false,
        error: {
          message: "User ID, title, and description are required"
        }
      });
    }
    
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
    
    // Create new goal
    const goal = await Goal.create(goalData);
    
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
    const { title, description, priority, targetDate, declaration, checkpoints, status } = req.body;
    
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

export {
  getAllGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  updateGoalStatus
}; 