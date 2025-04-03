import React from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';

/**
 * 资源与步骤设置
 * 第三步：用户确认自己有哪些资源、接下来的具体行动和每日任务
 */
const ResourcesStep = ({ 
  resources, 
  nextStep, 
  dailyTask, 
  onResourcesChange, 
  onNextStepChange, 
  onDailyTaskChange 
}) => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid md={12}>
          <Typography variant="h6" gutterBottom>
            这个目标是可行的，因为我有（能力或资源）
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            列出你已经拥有的能帮助你达成目标的能力、资源或优势。
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="现有资源"
            variant="outlined"
            value={resources}
            onChange={(e) => onResourcesChange(e.target.value)}
            placeholder="例如：我已经掌握了基础知识，有固定的学习时间..."
            inputProps={{ maxLength: 500 }}
            helperText={`${resources.length}/500 字符`}
          />
        </Grid>
        
        <Grid md={12}>
          <Typography variant="h6" gutterBottom>
            朝向这个目标我现在就可以做的一件事是
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            确定一个具体的、立即可行的步骤，这将帮助你启动目标实现的过程。
          </Typography>
          
          <TextField
            fullWidth
            label="下一步行动"
            variant="outlined"
            value={nextStep}
            onChange={(e) => onNextStepChange(e.target.value)}
            placeholder="例如：今天晚上花 30 分钟整理学习资料..."
            inputProps={{ maxLength: 200 }}
            helperText={`${nextStep.length}/200 字符`}
          />
        </Grid>
        
        <Grid md={12}>
          <Typography variant="h6" gutterBottom>
            我可以每天跟踪的关于这个目标的一件事是
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            设定一个每日可执行的小任务，持续的小进步将累积成显著的成果。
          </Typography>
          
          <TextField
            fullWidth
            label="每日任务"
            variant="outlined"
            value={dailyTask}
            onChange={(e) => onDailyTaskChange(e.target.value)}
            placeholder="例如：阅读 20 页专业书籍、跑步 30 分钟..."
            inputProps={{ maxLength: 200 }}
            helperText={`${dailyTask.length}/200 字符`}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResourcesStep; 