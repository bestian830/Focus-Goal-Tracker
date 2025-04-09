import express from "express";
const router = express.Router();
import {
  getAllGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  updateGoalStatus,
  addOrUpdateDailyCard
} from "../controllers/goalsController.js";
import { requireAuth, requireOwnership } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import Goal from '../models/Goal.js';

/**
 * Goals Routes
 * Base path: /api/goals
 * 
 * These routes handle goal management operations:
 * - Get all goals for a user
 * - Create a new goal
 * - Get details for a specific goal
 * - Update a goal
 * - Delete a goal
 * - Update goal status
 * - Add/update daily card
 */

// Apply rate limiter to all goal routes
router.use(rateLimiter({ maxRequests: 200, windowMs: 15 * 60 * 1000 }));

// GET /api/goals/:userId - Get all goals for a user
router.get("/:userId", requireAuth, requireOwnership((req) => req.params.userId), getAllGoals);

// POST /api/goals - Create a new goal
router.post("/", requireAuth, async (req, res, next) => {
  try {
    // 检查并记录用户信息和请求体
    const { userId } = req.body;
    const authUser = req.user;
    
    console.log("创建目标请求:", { 
      认证用户: {
        类型: authUser.userType,
        ID: authUser.userType === 'registered' ? authUser.id : authUser.tempId
      },
      请求体用户ID: userId,
      是临时ID: userId && userId.toString().startsWith('temp_'),
      完整请求体: {
        ...req.body,
        description: req.body.description ? `${req.body.description.substring(0, 20)}...` : undefined
      }
    });
    
    // 临时用户身份验证
    if (userId && userId.toString().startsWith('temp_')) {
      // 确保创建目标的用户是自己
      if (authUser.userType !== 'temp' || authUser.tempId !== userId) {
        console.log("临时用户ID不匹配:", {
          authTempId: authUser.tempId,
          requestUserId: userId
        });
        return res.status(403).json({
          success: false,
          error: { message: '无权为其他用户创建目标' }
        });
      }
      
      console.log("临时用户身份验证通过，继续创建目标");
      
      // 检查临时用户是否存在
      try {
        const TempUser = await import("../models/TempUser.js").then(module => module.default);
        const tempUser = await TempUser.findOne({ tempId: userId });
        
        if (!tempUser) {
          console.log(`临时用户不存在: ${userId}`);
          return res.status(404).json({
            success: false,
            error: {
              message: "临时用户不存在，请刷新页面重试"
            }
          });
        }
      } catch (err) {
        console.error("查询临时用户时出错:", err);
        return res.status(500).json({
          success: false,
          error: {
            message: "验证临时用户时出错",
            details: err.message
          }
        });
      }
    }
    
    // 继续执行原始的 createGoal 控制器
    next();
  } catch (error) {
    console.error("路由中间件错误:", error);
    next(error);
  }
}, createGoal);

// GET /api/goals/detail/:id - Get a specific goal
router.get("/detail/:id", requireAuth, requireOwnership(async (req) => {
  // Get the goal from database to check ownership
  const goal = await Goal.findById(req.params.id);
  return goal ? goal.userId : null;
}), getGoalById);

// PUT /api/goals/:id - Update a goal
router.put("/:id", requireAuth, requireOwnership(async (req) => {
  // Get the goal from database to check ownership
  const goal = await Goal.findById(req.params.id);
  return goal ? goal.userId : null;
}), updateGoal);

// DELETE /api/goals/:id - Delete a goal
router.delete("/:id", requireAuth, requireOwnership(async (req) => {
  // Get the goal from database to check ownership
  const goal = await Goal.findById(req.params.id);
  return goal ? goal.userId : null;
}), deleteGoal);

// PUT /api/goals/:id/status - Update goal status
router.put("/:id/status", requireAuth, requireOwnership(async (req) => {
  // Get the goal from database to check ownership
  const goal = await Goal.findById(req.params.id);
  return goal ? goal.userId : null;
}), updateGoalStatus);

// POST /api/goals/:id/daily-card - Add or update a daily card
router.post("/:id/daily-card", requireAuth, requireOwnership(async (req) => {
  // Get the goal from database to check ownership
  const goal = await Goal.findById(req.params.id);
  return goal ? goal.userId : null;
}), addOrUpdateDailyCard);

export default router; 