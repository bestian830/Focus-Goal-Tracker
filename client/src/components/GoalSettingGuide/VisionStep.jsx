import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardMedia, CircularProgress, Alert, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import apiService from '../../services/api';
import axios from 'axios';

/**
 * Vision Setting Step
 * Step 4: User uploads an image representing the goal vision (optional)
 */
const VisionStep = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('File upload - User selected file:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`
    });
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG, GIF, etc.)');
      console.error('File type error:', file.type);
      return;
    }
    
    // Check file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      setError('Image size cannot exceed 1MB');
      console.error('File too large:', `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting to upload image to Cloudinary...');
      
      // Try using server-side upload (recommended)
      const useServerUpload = true; // Set to true to use server-side upload
      
      if (useServerUpload) {
        // Method 2: Using server-side direct upload - more secure and no client signature needed
        console.log('Using server-side direct upload mode');
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        // Send to our backend API
        const uploadRes = await axios.post('/api/uploads/direct', file, { 
          baseURL: apiService.getDiagnostics().apiUrl,
          withCredentials: true,
          headers: {
            'Content-Type': file.type
          }
        });
        
        console.log('Image upload successful:', uploadRes.data);
        
        // Use the optimized URL provided by the backend
        onChange(uploadRes.data.data.optimized_url);
        
        console.log('Image processing complete, optimized URL:', uploadRes.data.data.optimized_url);
      } else {
        // Method 1: Original client-side signature upload mode
        // Get Cloudinary upload signature
        const signatureRes = await axios.get('/api/uploads/signature', { 
          baseURL: apiService.getDiagnostics().apiUrl,
          withCredentials: true 
        });
        const { signature, timestamp, folder, cloudName, apiKey } = signatureRes.data;
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);
        formData.append('folder', folder);
        
        // Upload to Cloudinary - add more appropriate headers and CORS settings
        console.log('Preparing to upload to Cloudinary, parameters:', {
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
            // Don't add Content-Type header, as FormData will automatically add the correct multipart/form-data and boundary
          },
          mode: 'cors'
        });
        
        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          console.error('Cloudinary upload failed:', {
            status: uploadRes.status,
            statusText: uploadRes.statusText,
            responseBody: errorText
          });
          throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText} - ${errorText}`);
        }
        
        const uploadData = await uploadRes.json();
        console.log('Image upload successful:', uploadData);
        
        // Get and use optimized URL
        const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_800/${uploadData.public_id}`;
        onChange(optimizedUrl);
        
        console.log('Image processing complete, optimized URL:', optimizedUrl);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error uploading image, please try again');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle clearing image
  const handleClear = () => {
    console.log('Clear image button clicked');
    // Set image value to null
    onChange(null);
    console.log('Image value has been set to null');
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose a vision image for this goal (optional)
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Selecting an image that represents your goal vision can enhance motivation and help you stay focused.
        This step is optional. If you don't have a suitable image now, you can skip it or add one later.
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
              {loading ? 'Uploading...' : 'Select Image'}
            </Button>
          </label>
          
          {value ? (
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={handleClear}
              startIcon={<DeleteIcon />}
            >
              Clear Image
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
            alt="Goal Vision"
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