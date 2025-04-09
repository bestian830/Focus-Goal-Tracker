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
      
      // 嘗試使用服務器端上傳方式 (推薦)
      const useServerUpload = true; // 設置為 true 使用服務器端上傳
      
      if (useServerUpload) {
        // 方式二：使用服務器端直接上傳 - 更安全且無需客戶端簽名
        console.log('使用服務器端直接上傳模式');
        
        // 創建表單數據
        const formData = new FormData();
        formData.append('file', file);
        
        // 發送到我們的後端 API
        const uploadRes = await axios.post('/api/uploads/direct', file, { 
          baseURL: apiService.getDiagnostics().apiUrl,
          withCredentials: true,
          headers: {
            'Content-Type': file.type
          }
        });
        
        console.log('圖片上傳成功:', uploadRes.data);
        
        // 使用後端提供的優化 URL
        onChange(uploadRes.data.data.optimized_url);
        
        console.log('圖片處理完成，優化後的URL:', uploadRes.data.data.optimized_url);
      } else {
        // 方式一：原來的客戶端簽名上傳模式
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
        
        // 上传到 Cloudinary - 添加更多適當的頭信息和跨域設置
        console.log('準備上傳到 Cloudinary，參數:', {
          cloudName,
          fileType: file.type,
          fileSize: file.size,
          timestamp,
          folderPath: folder
        });
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            // 不要添加 Content-Type 頭，因為 FormData 會自動添加正確的 multipart/form-data 及邊界
          },
          mode: 'cors'
        });
        
        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          console.error('Cloudinary 上傳失敗:', {
            狀態: uploadRes.status,
            狀態文本: uploadRes.statusText,
            響應正文: errorText
          });
          throw new Error(`上传失败: ${uploadRes.status} ${uploadRes.statusText} - ${errorText}`);
        }
        
        const uploadData = await uploadRes.json();
        console.log('图片上传成功:', uploadData);
        
        // 获取并使用优化的 URL
        const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_800/${uploadData.public_id}`;
        onChange(optimizedUrl);
        
        console.log('图片处理完成，优化后的URL:', optimizedUrl);
      }
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