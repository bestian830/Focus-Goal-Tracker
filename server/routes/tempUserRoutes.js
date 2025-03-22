const express = require("express");
const router = express.Router();
const TempUser = require("../models/TempUser");
const { generateTempToken, setTokenCookie, verifyToken } = require('../utils/jwtUtils');
const { requireAuth, requireOwnership } = require('../middleware/auth');

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
    // 檢查是否已經有臨時用戶的token
    const existingToken = req.cookies.token;
    
    if (existingToken) {
      // 驗證token是否有效
      const decoded = verifyToken(existingToken);
      
      if (decoded && decoded.userType === 'temp') {
        // 檢查此臨時用戶是否仍存在於數據庫中
        const existingTempUser = await TempUser.findOne({ tempId: decoded.tempId });
        
        if (existingTempUser) {
          // 如果找到已存在的臨時用戶，則返回該用戶信息
          return res.status(200).json({
            success: true,
            message: "使用現有的臨時用戶",
            data: {
              tempId: existingTempUser.tempId,
              createdAt: existingTempUser.createdAt,
              expiresAt: existingTempUser.expiresAt
            }
          });
        }
        // 如果找不到用戶，繼續創建新的臨時用戶
      }
    }
    
    // 生成帶有"temp_"前綴和隨機字符串的臨時ID
    const tempId = `temp_${Math.random().toString(36).substring(2, 10)}`;
    
    // 在數據庫中創建新的臨時用戶
    const tempUser = await TempUser.create({
      tempId
    });
    
    // 為臨時用戶生成JWT token
    const token = generateTempToken(tempId);
    
    // 將JWT token設置為HttpOnly cookie
    setTokenCookie(res, token);
    
    // 返回臨時用戶數據（返回tempId以便可以存儲在localStorage作為備份）
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