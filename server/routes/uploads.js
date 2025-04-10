import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { requireAuth } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// set up  Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * gain Cloudinary upload signature
 * @route GET /api/uploads/signature
 * @access Private - requires authentication
 */
router.get('/signature', requireAuth, (req, res) => {
  try {
    // 獲取用戶ID (支持正式用戶和臨時用戶)
    const userId = req.user?.id || req.user?.tempId || 'unknown';
    // 設置上傳文件夾，按用戶ID分類
    const folder = `focus_vision_images/${userId}`;
    // 生成時間戳
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 生成上傳簽名，並設置限制
    const signature = cloudinary.utils.api_sign_request({
      timestamp,
      folder,
      allowed_formats: 'jpg,jpeg,png,gif,webp',
      max_file_size: 1000000 // 限制為1MB
    }, process.env.CLOUDINARY_API_SECRET);

    console.log('生成簽名成功:', {
      userId,
      timestamp,
      folder,
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
    console.error('generate upload signature error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'generate upload signature error',
        details: error.message
      }
    });
  }
});

/**
 * health check endpoint, for testing upload API is running
 * @route GET /api/uploads/health
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cloudinary upload API is running',
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && 
                    process.env.CLOUDINARY_API_KEY && 
                    process.env.CLOUDINARY_API_SECRET)
    }
  });
});

/**
 * upload image directly to Cloudinary (server-side upload)
 * @route POST /api/uploads/direct
 * @access Private - requires authentication
 */
router.post('/direct', requireAuth, express.raw({ type: 'image/*', limit: '1mb' }), async (req, res) => {
  try {
    if (!req.body || !req.body.length) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'no image data received' } 
      });
    }

    // 獲取用戶ID (支持正式用戶和臨時用戶)
    const userId = req.user?.id || req.user?.tempId || 'unknown';
    
    console.log('received direct upload request', {
      userId,
      contentType: req.headers['content-type'],
      dataSize: req.body.length,
    });

    // convert Buffer to base64 format
    const base64Data = `data:${req.headers['content-type']};base64,${req.body.toString('base64')}`;
    
    // use official method to upload
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: `focus_vision_images/${userId}`,
      resource_type: 'image',
    });

    console.log('Cloudinary direct upload successfully:', {
      public_id: uploadResult.public_id,
      URL: uploadResult.secure_url,
      format: uploadResult.format,
      size: uploadResult.bytes,
    });

    // return result
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
    console.error('direct upload image to Cloudinary failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'upload image failed',
        details: error.message
      }
    });
  }
});

export default router;
