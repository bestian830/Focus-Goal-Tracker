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
    // 獲取當前用戶的ID
    const userId = req.user.id;

    // 根據ID查找用戶
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
        },
      });
    }

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
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch user profile",
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