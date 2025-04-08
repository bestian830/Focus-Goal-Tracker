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

// 修改此路由以调用实际服务
router.post('/:goalId', requireAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    // 从请求体获取 timeRange，如果未提供则默认为 'daily'
    // 前端目前固定发送 'daily'
    const timeRange = req.body.timeRange || 'daily'; 
    const userId = req.user.id; // 由 requireAuth 中间件提供

    console.log('Received request to generate report:', { goalId, userId, timeRange });

    // 调用 ReportService 来生成报告
    const report = await ReportService.generateReport(goalId, userId, timeRange);

    console.log(`Report generated successfully for goal ${goalId}, report ID: ${report._id}`);

    // 将生成的报告数据返回给前端
    res.json({ 
      success: true, 
      data: report // 发送完整的报告对象
    });

  } catch (error) {
    console.error(`Error in POST /api/reports/${req.params.goalId}:`, error);
    // 返回 500 错误和错误信息
    res.status(500).json({ 
      success: false, 
      // 在生产环境中考虑返回更通用的错误信息
      error: error.message || 'Failed to generate report due to an internal server error.' 
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
