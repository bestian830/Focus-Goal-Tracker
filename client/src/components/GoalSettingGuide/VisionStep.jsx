import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardMedia, CircularProgress, Alert, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import apiService from '../../services/api';
import axios from 'axios';

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
    if (!file) {
      console.log('没有选择文件');
      return;
    }
    
    console.log('文件上传 - 用户选择了文件:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`
    });
    
    // 检查文件类型
    if (!file.type.match('image.*')) {
      setError('请上传图片文件（JPEG, PNG, GIF等）');
      console.error('文件类型错误:', file.type);
      return;
    }
    
    // 检查文件大小（最大 1MB）
    if (file.size > 1 * 1024 * 1024) {
      setError('图片大小不能超过 1MB');
      console.error('文件太大:', `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('开始上传图片到 Cloudinary...');
      
      // 获取 Cloudinary 上传签名
      const signatureRes = await axios.get('/api/uploads/signature', { 
        baseURL: apiService.getDiagnostics().apiUrl,
        withCredentials: true 
      });
      const { signature, timestamp, folder, cloudName, apiKey } = signatureRes.data;
      
      // 创建表单数据
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);
      
      // 上传到 Cloudinary
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadRes.ok) {
        throw new Error(`上传失败: ${uploadRes.statusText}`);
      }
      
      const uploadData = await uploadRes.json();
      console.log('图片上传成功:', uploadData);
      
      // 获取并使用优化的 URL
      const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_800/${uploadData.public_id}`;
      onChange(optimizedUrl);
      
      console.log('图片处理完成，优化后的URL:', optimizedUrl);
    } catch (err) {
      console.error('上传图片时出错:', err);
      setError('上传图片时出错，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理清除图片
  const handleClear = () => {
    console.log('清除图片按钮被点击');
    // 将图片值设为null
    onChange(null);
    console.log('图片值已设置为null');
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
              startIcon={<DeleteIcon />}
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