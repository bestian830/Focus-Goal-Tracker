import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardMedia, CircularProgress, Alert, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SkipNextIcon from '@mui/icons-material/SkipNext';

/**
 * 愿景设定步骤
 * 第四步：用户上传代表目标愿景的图片（可选）
 */
const VisionStep = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 处理文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.match('image.*')) {
      setError('请上传图片文件（JPEG, PNG, GIF等）');
      return;
    }
    
    // 检查文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // TODO: 实现与 Cloudinary 的集成
      // 暂时使用本地 URL 作为示例
      const imageUrl = URL.createObjectURL(file);
      onChange(imageUrl);
    } catch (err) {
      console.error('上传图片时出错:', err);
      setError('上传图片时出错，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理跳过上传
  const handleSkip = () => {
    // 添加调试日志
    console.log('跳过上传图片按钮被点击');
    console.log('当前图片值:', value);
    
    // 将图片值设为null，表示用户选择不上传图片
    onChange(null);
    
    // 再次打印确认值被更新
    console.log('图片值已设置为null');
  };
  
  // 处理清除图片
  const handleClear = () => {
    // 将图片值设为null，保持与handleSkip一致
    onChange(null);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        为这个目标选择一个愿景图片（可选）
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        选择一张能代表你目标愿景的图片可以增强动力，并帮助你保持聚焦。
        这一步是可选的，如果现在没有合适的图片，你可以跳过或稍后添加。
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <input
        type="file"
        accept="image/*"
        id="upload-vision-image"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <label htmlFor="upload-vision-image">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
            >
              {loading ? '上传中...' : '选择图片'}
            </Button>
          </label>
          
          {value ? (
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={handleClear}
            >
              清除图片
            </Button>
          ) : null}
        </Stack>
        
        {loading && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      
      {value && (
        <Card>
          <CardMedia
            component="img"
            image={value}
            alt="目标愿景"
            sx={{ 
              height: 240, 
              objectFit: 'contain',
              bgcolor: 'background.default'
            }}
          />
        </Card>
      )}
    </Box>
  );
};

export default VisionStep; 