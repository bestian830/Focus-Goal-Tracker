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

// GET /api/goals/:userId - Get all goals for a user
router.get("/:userId", getAllGoals);

// POST /api/goals - Create a new goal
router.post("/", createGoal);

// GET /api/goals/detail/:id - Get a specific goal
router.get("/detail/:id", getGoalById);

// PUT /api/goals/:id - Update a goal
router.put("/:id", updateGoal);

// DELETE /api/goals/:id - Delete a goal
router.delete("/:id", deleteGoal);

// PUT /api/goals/:id/status - Update goal status
router.put("/:id/status", updateGoalStatus);

module.exports = router; 