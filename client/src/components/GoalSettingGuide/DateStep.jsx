import React from 'react';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';

/**
 * 日期设定步骤
 * 用户设置目标完成日期
 */
const DateStep = ({ value, onChange }) => {
  // 处理日期变更
  const handleDateChange = (date) => {
    onChange(date);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        我计划在这个日期前实现目标 <Box component="span" sx={{ color: 'error.main' }}>*</Box>
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        为目标设定一个明确的时间期限，这能增加紧迫感并帮助你更好规划。
      </Typography>
      
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
        <DatePicker
          label="目标日期"
          value={value}
          onChange={handleDateChange}
          disablePast
          slotProps={{ 
            textField: { 
              fullWidth: true,
              required: true,
              variant: "outlined",
              helperText: "选择一个目标完成日期"
            } 
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default DateStep; 