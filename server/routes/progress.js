const express = require("express");
const router = express.Router();
const {
  getProgress,
  createProgress,
  updateProgress,
  deleteProgress,
  addRecord,
  updateCheckpointStatus,
  getProgressSummary
} = require("../controllers/progressController");

/**
 * Progress Routes
 * Base path: /api/progress
 * 
 * These routes handle progress tracking operations:
 * - Get progress records for a goal
 * - Create a new progress record
 * - Update progress record
 * - Delete progress record
 * - Add individual record to a progress document
 * - Update checkpoint status
 * - Get progress summary for a date range
 */

// GET /api/progress - Get progress records
// Use query params: ?goalId=123&date=2023-03-21 or ?goalId=123&startDate=2023-03-01&endDate=2023-03-31
router.get("/", getProgress);

// GET /api/progress/summary - Get progress summary for a date range
// Use query params: ?goalId=123&startDate=2023-03-01&endDate=2023-03-31
router.get("/summary", getProgressSummary);

// POST /api/progress - Create a new progress record
router.post("/", createProgress);

// PUT /api/progress/:id - Update a progress record
router.put("/:id", updateProgress);

// DELETE /api/progress/:id - Delete a progress record
router.delete("/:id", deleteProgress);

// POST /api/progress/:id/records - Add a record to an existing progress document
router.post("/:id/records", addRecord);

// PUT /api/progress/:id/checkpoints/:checkpointId - Update checkpoint status
router.put("/:id/checkpoints/:checkpointId", updateCheckpointStatus);

module.exports = router; 