import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { requireAuth } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 獲取 Cloudinary 上傳簽名
 * @route GET /api/uploads/signature
 * @access Private - 需要驗證
 */
router.get('/signature', requireAuth, (req, res) => {
  try {
    // 獲取用戶 ID (支持臨時用戶和注冊用戶)
    const userId = req.user?.id || req.user?.tempId || 'unknown';
    // 設定上傳目錄，按用戶 ID 分類
    const folder = `focus_vision_images/${userId}`;
    // 生成時間戳
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 生成上傳簽名，並設定限制
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      folder,
      allowed_formats: 'jpg,jpeg,png,gif,webp',
      max_file_size: 1000000 // 限制最大為 1MB
    }, process.env.CLOUDINARY_API_SECRET);

    // 返回簽名和其他需要的參數
    res.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error) {
    console.error('生成上傳簽名時出錯:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '生成上傳簽名失敗',
        details: error.message
      }
    });
  }
});

/**
 * 健康檢查端點，用於測試上傳 API 是否正常運行
 * @route GET /api/uploads/health
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cloudinary 上傳 API 正常運行',
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && 
                    process.env.CLOUDINARY_API_KEY && 
                    process.env.CLOUDINARY_API_SECRET)
    }
  });
});

export default router;
