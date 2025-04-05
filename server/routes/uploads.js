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
 * @access Public - 臨時測試用
 */
router.get('/signature', (req, res) => {
  try {
    // 測試時使用固定用戶ID，生產環境應使用 requireAuth 中間件
    const userId = 'test_user';
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

    console.log('生成簽名成功:', {
      時間戳: timestamp,
      文件夾: folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });

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

/**
 * 直接上傳圖片至 Cloudinary (伺服器端上傳)
 * @route POST /api/uploads/direct
 * @access Public - 測試用
 */
router.post('/direct', express.raw({ type: 'image/*', limit: '1mb' }), async (req, res) => {
  try {
    if (!req.body || !req.body.length) {
      return res.status(400).json({ 
        success: false, 
        error: { message: '未收到圖片資料' } 
      });
    }

    console.log('接收到直接上傳請求', {
      contentType: req.headers['content-type'],
      dataSize: req.body.length,
    });

    // 將 Buffer 轉為 base64 格式
    const base64Data = `data:${req.headers['content-type']};base64,${req.body.toString('base64')}`;
    
    // 使用官方方法直接上傳
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: 'focus_vision_images/test_user',
      resource_type: 'image',
    });

    console.log('Cloudinary 直接上傳成功:', {
      公開ID: uploadResult.public_id,
      URL: uploadResult.secure_url,
      格式: uploadResult.format,
      大小: uploadResult.bytes,
    });

    // 返回結果
    res.json({
      success: true,
      data: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        format: uploadResult.format,
        optimized_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto,w_800/${uploadResult.public_id}`
      }
    });
  } catch (error) {
    console.error('直接上傳圖片至 Cloudinary 失敗:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '上傳圖片失敗',
        details: error.message
      }
    });
  }
});

export default router;
