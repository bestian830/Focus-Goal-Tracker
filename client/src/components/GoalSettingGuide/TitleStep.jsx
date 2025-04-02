import React from 'react';
import { Box, TextField, Typography } from '@mui/material';

/**
 * 目标标题设置步骤
 * 第一步：用户输入想要达成的目标标题
 */
const TitleStep = ({ value, onChange }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        我最想要实现/完成的目标是
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        设定一个简明具体的目标。清晰的目标能让你更容易跟踪进度和最终成功实现。
      </Typography>
      
      <TextField
        fullWidth
        label="目标标题"
        variant="outlined"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如：每天冥想15分钟、完成网页开发课程..."
        inputProps={{ maxLength: 100 }}
        helperText={`${value.length}/100 字符`}
      />
    </Box>
  );
};

export default TitleStep; 