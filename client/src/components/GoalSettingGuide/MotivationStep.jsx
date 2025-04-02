import React from 'react';
import { Box, TextField, Typography } from '@mui/material';

/**
 * 动机探索步骤
 * 第二步：用户探索并表达他们为什么想要实现这个目标
 */
const MotivationStep = ({ value, onChange }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        我想要实现这个目标，主要是因为
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        深入思考你的动机，理解自己"为什么"想要实现这个目标。强烈的内在动机是坚持不懈的关键。
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        label="动机"
        variant="outlined"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如：这个目标对我很重要，因为..."
        inputProps={{ maxLength: 500 }}
        helperText={`${value.length}/500 字符`}
      />
    </Box>
  );
};

export default MotivationStep; 