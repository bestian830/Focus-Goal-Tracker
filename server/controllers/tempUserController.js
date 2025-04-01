import TempUser from "../models/TempUser.js";
import { generateTempToken, setTokenCookie, clearTokenCookie, verifyToken } from '../utils/jwtUtils.js';

/**
 * Create a new temporary user
 * @route POST /api/temp-users
 * @access Public
 */
export const createTempUser = async (req, res) => {
  try {
    // check if there is already a temp user's token
    const existingToken = req.cookies.token;
    // 检查客户端是否传递了现有的 tempId
    const clientTempId = req.body.existingTempId;
    
    console.log(`Request for temp user creation - existingToken: ${existingToken ? 'yes' : 'no'}, clientTempId: ${clientTempId || 'none'}`);
    
    // 首先检查客户端传递的 tempId
    if (clientTempId) {
      // 检查这个 tempId 是否存在于数据库中
      const existingTempUser = await TempUser.findOne({ tempId: clientTempId });
      
      if (existingTempUser) {
        // 如果存在，生成新的 JWT token 并设置 cookie
        const token = generateTempToken(clientTempId);
        setTokenCookie(res, token, 14 * 24 * 60 * 60 * 1000); // 14 days
        
        console.log(`Using existing temp user: ${clientTempId}`);
        
        // 返回现有临时用户数据
        return res.status(200).json({
          success: true,
          message: "Using existing temp user from client",
          data: {
            tempId: existingTempUser.tempId,
            createdAt: existingTempUser.createdAt,
            expiresAt: existingTempUser.expiresAt
          }
        });
      } else {
        console.log(`Client provided tempId ${clientTempId} not found in database, will create new temp user`);
      }
      // 如果客户端传递的 tempId 不存在，继续检查 token 或创建新用户
    }
    
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
    setTokenCookie(res, token, 14 * 24 * 60 * 60 * 1000); // 14 days
    
    console.log(`Created new temp user: ${tempId}`);
    
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
};

/**
 * Get temporary user by ID
 * @route GET /api/temp-users/:tempId
 * @access Private (owner only)
 */
export const getTempUserById = async (req, res) => {
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
};

/**
 * Add a goal to temporary user
 * @route POST /api/temp-users/:tempId/goals
 * @access Private (owner only)
 */
export const addGoalToTempUser = async (req, res) => {
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
};

/**
 * Delete a temporary user
 * @route DELETE /api/temp-users/:tempId
 * @access Private (owner only)
 */
export const deleteTempUser = async (req, res) => {
  try {
    const { tempId } = req.params;
    
    // Check if the user is authenticated as the temp user they're trying to delete
    if (req.user.userType !== 'temp' || req.user.tempId !== tempId) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied. You can only delete your own temporary account." }
      });
    }
    
    // Delete the temporary user
    const deletedUser = await TempUser.findOneAndDelete({ tempId });
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: { message: "Temporary user not found" }
      });
    }
    
    // Clear the authentication cookie
    clearTokenCookie(res);
    
    res.status(200).json({
      success: true,
      message: "Temporary user account deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting temporary user:", error);
    res.status(500).json({
      success: false,
      error: { message: "Server error", details: error.message }
    });
  }
}; 