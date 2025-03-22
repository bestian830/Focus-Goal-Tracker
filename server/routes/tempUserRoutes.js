const express = require("express");
const router = express.Router();
const TempUser = require("../models/TempUser");
const { generateTempToken, setTokenCookie, verifyToken } = require('../utils/jwtUtils');
const { requireAuth, requireOwnership } = require('../middleware/auth');
const { tempUserCreationLimiter, rateLimiter } = require('../middleware/rateLimiter');

/**
 * TempUser Routes
 * Base path: /api/temp-users
 * 
 * These routes handle temporary user operations:
 * - Creating a new temporary user
 * - Getting temp user by ID
 * - Adding goals to temp user
 */

// Apply general rate limiter to all temp user routes
router.use(rateLimiter({ maxRequests: 200, windowMs: 15 * 60 * 1000 })); // 200 requests per 15 minutes

// POST /api/temp-users - Create a new temporary user
// Apply specific stricter rate limiter for temp user creation
router.post("/", tempUserCreationLimiter({ maxCreations: 5, windowMs: 60 * 60 * 1000 }), async (req, res) => {
  try {
    // check if there is already a temp user's token
    const existingToken = req.cookies.token;
    
    if (existingToken) {
      // check if the token is valid
      const decoded = verifyToken(existingToken);
      
      if (decoded && decoded.userType === 'temp') {
        // check if the temp user still exists in the database
        const existingTempUser = await TempUser.findOne({ tempId: decoded.tempId });
        
        if (existingTempUser) {
          // if the existing temp user is found, return the user information
          return res.status(200).json({
            success: true,
            message: "use the existing temp user",
            data: {
              tempId: existingTempUser.tempId,
              createdAt: existingTempUser.createdAt,
              expiresAt: existingTempUser.expiresAt
            }
          });
        }
        // if the user is not found, continue to create a new temp user
      }
    }
    
    // generate a temp id with "temp_" prefix and random string
    const tempId = `temp_${Math.random().toString(36).substring(2, 10)}`;
    
    // create a new temp user in the database
    const tempUser = await TempUser.create({
      tempId
    });
    
    // generate a JWT token for the temp user
    const token = generateTempToken(tempId);
    
    // set the JWT token as an HttpOnly cookie
    setTokenCookie(res, token);
    
    // return the temp user data (return tempId so it can be stored in localStorage as backup)
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
router.get("/:tempId", requireAuth, requireOwnership((req) => req.params.tempId), async (req, res) => {
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
router.post("/:tempId/goals", requireAuth, requireOwnership((req) => req.params.tempId), async (req, res) => {
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