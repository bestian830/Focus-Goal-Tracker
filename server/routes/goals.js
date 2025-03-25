const express = require("express");
const router = express.Router();
const {
  getAllGoals,
  createGoal,
  getGoalById,
  updateGoal,
  deleteGoal,
  updateGoalStatus
} = require("../controllers/goalsController");
const { requireAuth, requireOwnership } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const Goal = require('../models/Goal');

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
 */

// Apply rate limiter to all goal routes
router.use(rateLimiter({ maxRequests: 200, windowMs: 15 * 60 * 1000 }));

// GET /api/goals/:userId - Get all goals for a user
router.get("/:userId", requireAuth, requireOwnership((req) => req.params.userId), getAllGoals);

// POST /api/goals - Create a new goal
router.post("/", requireAuth, createGoal);

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

module.exports = router; 