import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import ReportService from '../services/ReportService.js';

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

// 简化的生成报告路由 - 暂时不调用 ReportService
router.post('/:goalId', requireAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { timeRange } = req.body;
    const userId = req.user.id;

    console.log('简化的生成报告路由被调用:', {
      goalId,
      userId,
      timeRange
    });

    // 返回成功响应，不实际生成报告
    res.json({ 
      success: true, 
      data: {
        goalId,
        userId,
        timeRange,
        message: '这是一个测试响应，没有实际生成报告'
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
