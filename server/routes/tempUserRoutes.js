const express = require("express");
const router = express.Router();
const TempUser = require("../models/TempUser");
const cookieParser = require('cookie-parser');

/**
 * TempUser Routes
 * Base path: /api/temp-users
 * 
 * These routes handle temporary user operations:
 * - Creating a new temporary user
 * - Getting temp user by ID
 * - Adding goals to temp user
 */

// POST /api/temp-users - Create a new temporary user
router.post("/", async (req, res) => {
  try {
    // Generate a random tempId with "temp_" prefix and random string
    const tempId = `temp_${Math.random().toString(36).substring(2, 10)}`;
    
    // Create a new temp user in the database
    const tempUser = await TempUser.create({
      tempId
    });
    
    // Return temp user data
    res.status(201).json({
      success: true,
      data: {
        tempId: tempUser.tempId,
        createdAt: tempUser.createdAt,
        expiresAt: tempUser.expiresAt
      },
    });
  } catch (error) {
    console.error("Error creating temporary user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create temporary user",
        details: error.message,
      },
    });
  }
});

// GET /api/temp-users/:tempId - Get temporary user by ID
router.get("/:tempId", async (req, res) => {
  try {
    const tempUser = await TempUser.findOne({ tempId: req.params.tempId });
    
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        error: { message: "Temporary user not found" }
      });
    }
    
    res.status(200).json({
      success: true,
      data: tempUser
    });
  } catch (error) {
    console.error("Error fetching temporary user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch temporary user",
        details: error.message
      }
    });
  }
});

// POST /api/temp-users/:tempId/goals - Add a goal to temporary user
router.post("/:tempId/goals", async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: { message: "Please provide a goal title" }
      });
    }
    
    const tempUser = await TempUser.findOne({ tempId: req.params.tempId });
    
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        error: { message: "Temporary user not found" }
      });
    }
    
    // Check if temp user already has a goal (limited to one)
    if (tempUser.goals && tempUser.goals.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Temporary users are limited to one goal. Please register for a full account." }
      });
    }
    
    // Add the goal
    tempUser.goals.push({
      title,
      description: description || ""
    });
    
    await tempUser.save();
    
    res.status(201).json({
      success: true,
      data: {
        message: "Goal added successfully",
        goal: tempUser.goals[0]
      }
    });
  } catch (error) {
    console.error("Error adding goal to temporary user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to add goal",
        details: error.message
      }
    });
  }
});

module.exports = router; 