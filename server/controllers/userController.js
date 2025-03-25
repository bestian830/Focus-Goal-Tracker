/**
 * User Controller
 * 
 * This controller handles user profile operations:
 * - Getting user profile information
 * - Updating user profile
 * - Changing user password
 * - Deleting user account
 */

import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Get user profile information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    console.log("=== 獲取用戶資料請求 ===");
    console.log("用戶類型:", req.user?.userType);
    console.log("用戶ID:", req.user?.id);
    console.log("=====================");

    // 檢查用戶認證狀態
    if (!req.user) {
      console.error("未找到用戶認證信息");
      return res.status(401).json({
        success: false,
        error: {
          message: "未授權訪問",
        },
      });
    }

    // 檢查用戶類型
    if (req.user.userType !== 'registered') {
      console.error("非註冊用戶嘗試訪問個人資料");
      return res.status(403).json({
        success: false,
        error: {
          message: "只有註冊用戶可以訪問個人資料",
        },
      });
    }

    // 獲取當前用戶的ID
    const userId = req.user.id;

    // 根據ID查找用戶
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.error(`未找到ID為 ${userId} 的用戶`);
      return res.status(404).json({
        success: false,
        error: {
          message: "用戶不存在",
        },
      });
    }

    console.log(`成功獲取用戶資料: ${user.username}`);
    
    // 返回用戶信息
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("獲取用戶資料時發生錯誤:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "獲取用戶資料失敗",
        details: error.message,
      },
    });
  }
};

/**
 * Update user profile information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    // 验证输入
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        error: { message: "Please provide username or email to update" }
      });
    }

    // 查找并更新用户信息
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }

    // 更新信息
    if (username) user.username = username;
    if (email) user.email = email;
    
    await user.save();

    // 返回更新后的用户信息
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update user profile",
        details: error.message
      }
    });
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // 验证输入
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: "Please provide both current and new password" }
      });
    }

    // 查找用户
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }

    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Current password is incorrect" }
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to change password",
        details: error.message
      }
    });
  }
};

/**
 * Delete user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // 查找并删除用户
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }

    // 还可以在这里添加删除用户相关数据的逻辑
    // 例如删除用户的目标、进度记录等

    res.status(200).json({
      success: true,
      message: "User account deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to delete user account",
        details: error.message
      }
    });
  }
};

export {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
};