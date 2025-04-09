import express from 'express';
import { requireAuth } from '../middleware/auth.js';
// Remove unused import for ReportService
// import ReportService from '../services/ReportService.js'; 
import { generateReport } from '../controllers/reportsController.js';
import { requireOwnership } from '../middleware/auth.js';
import Goal from '../models/Goal.js';

const router = express.Router();

// 测试路由 - 不需要身份验证
router.get('/test', (req, res) => {
  console.log('测试路由被调用');
  res.json({ success: true, message: '报告API测试成功' });
});

// 鉴权测试路由
router.get('/auth-test', requireAuth, (req, res) => {
  console.log('鉴权测试路由被调用，用户ID:', req.user.id);
  res.json({ 
    success: true, 
    message: '鉴权成功',
    user: {
      id: req.user.id,
      userType: req.user.userType
    }
  });
});

/**
 * @route   POST /api/reports/:goalId
 * @desc    Generate an AI progress report for a specific goal
 * @access  Private (Requires authentication and ownership)
 */
router.post(
  '/:goalId',
  requireAuth,
  // Add ownership check middleware - ensures the user owns the goal
  requireOwnership(async (req) => {
    try {
      const goal = await Goal.findById(req.params.goalId);
      if (!goal) {
        console.warn(`Ownership check failed: Goal not found with ID ${req.params.goalId}`);
        return null; // Goal not found, ownership check fails
      }
      console.log(`Ownership check: User ${req.user.id} attempting to access goal owned by ${goal.userId}`);
      return goal.userId; // Return the owner's ID for comparison
    } catch (error) {
      console.error(`Error during ownership check for goal ${req.params.goalId}:`, error);
      return null; // Error occurred, treat as ownership failure
    }
  }),
  generateReport
);

// 获取最新报告
router.get('/:goalId/latest', requireAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    console.log('获取最新报告被调用:', {
      goalId,
      userId
    });

    // 简化响应
    res.json({ 
      success: true, 
      data: {
        goalId,
        userId,
        message: '这是一个测试响应，没有实际获取报告'
      }
    });
  } catch (error) {
    console.error('错误:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
