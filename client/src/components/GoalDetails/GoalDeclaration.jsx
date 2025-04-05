import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  IconButton, 
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import styles from './GoalDeclaration.module.css';
import apiService from '../../services/api';

/**
 * 可编辑字段组件 - 允许直接编辑文本
 */
const EditableField = ({ value, onChange, multiline = false }) => {
  const [fieldValue, setFieldValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleChange = (e) => {
    setFieldValue(e.target.value);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    onChange(fieldValue);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.target.blur();
    }
  };
  
  return (
    <span className={`${styles.editableField} ${isFocused ? styles.editing : ''}`}>
      {multiline ? (
        <textarea
          value={fieldValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className={styles.editInput}
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={fieldValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          className={styles.editInput}
        />
      )}
    </span>
  );
};

/**
 * GoalDeclaration - 目标宣言组件
 * 展示和编辑用户的目标宣言
 * 
 * @param {Object} props 
 * @param {Object} props.goal - 目标对象
 * @param {boolean} props.isOpen - 是否显示对话框
 * @param {Function} props.onClose - 关闭回调
 * @param {Function} props.onSave - 保存回调
 */
export default function GoalDeclaration({ goal, isOpen, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedData, setEditedData] = useState({
    title: '',
    motivation: '',
    resources: '',
    nextStep: '',
    dailyTask: '',
    dailyReward: '',
    ultimateReward: '',
    targetDate: null
  });
  
  // 当目标数据改变时，更新编辑数据
  useEffect(() => {
    if (goal) {
      setEditedData({
        title: goal.title || '',
        motivation: goal.details?.motivation || '',
        resources: goal.details?.resources || '',
        nextStep: goal.details?.nextStep || '',
        dailyTask: goal.currentSettings?.dailyTask || '',
        dailyReward: goal.currentSettings?.dailyReward || '',
        ultimateReward: goal.details?.ultimateReward || '',
        targetDate: goal.targetDate || new Date()
      });
    }
  }, [goal]);
  
  // 处理字段更新
  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // 生成宣言文本
  const generateDeclarationText = (data) => {
    const {
      title,
      motivation,
      resources,
      nextStep,
      dailyTask,
      dailyReward,
      ultimateReward,
      targetDate
    } = data;
    
    const username = 'User'; // 可以根据实际情况获取
    const formattedDate = targetDate ? new Date(targetDate).toLocaleDateString() : '';
    const visionImagePlaceholder = '[Vision Image]';
    
    return `${title}

This goal isn't just another item on my list—it's something I genuinely want to achieve

I'm ${username}, and I'm stepping onto this path because ${motivation}. It's something deeply meaningful to me, a desire that comes straight from my heart.

I trust that I have what it takes, because I already hold ${resources} in my hands—these are my sources of confidence and strength as I move forward.

I don't need to wait until I'm "fully ready." The best moment to start is right now. Next, I'll ${nextStep}, beginning with this first step and letting the momentum carry me onward.

I understand that as long as I commit to ${dailyTask} each day, little by little, I'll steadily move closer to the goal I'm eager to achieve.

When I close my eyes, I clearly see this image: ${visionImagePlaceholder}. It's not just a vision of my desired outcome; it's the driving force that moves me forward today.

Every time I complete my daily milestone, I'll reward myself with something small and meaningful: ${dailyReward}. When I fully accomplish my goal, I'll celebrate this journey by treating myself to ${ultimateReward}, as recognition for what I've achieved.

I've set a deadline for myself: ${formattedDate}. I know there might be ups and downs along the way, but I deeply believe I have enough resources and strength to keep going.

Because the path is already beneath my feet—it's really not that complicated. All I need to do is stay focused and adjust my pace when needed ^^.`;
  };
  
  // 格式化宣言内容
  const formatDeclarationContent = (content) => {
    if (!content) return null;
    
    return content.split('\n\n').map((paragraph, index) => (
      <Typography key={index} className={styles.paragraph} variant="body1">
        {paragraph}
      </Typography>
    ));
  };
  
  // 渲染编辑模式的宣言
  const renderEditableDeclaration = () => {
    return (
      <div className={styles.declaration}>
        <Typography variant="h4" className={styles.title}>
          <EditableField 
            value={editedData.title} 
            onChange={(value) => handleFieldChange('title', value)} 
          />
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          This goal isn't just another item on my list—it's something I genuinely want to achieve
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          I'm stepping onto this path because <EditableField 
            value={editedData.motivation} 
            onChange={(value) => handleFieldChange('motivation', value)}
            multiline 
          />. It's something deeply meaningful to me, a desire that comes straight from my heart.
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          I trust that I have what it takes, because I already hold <EditableField 
            value={editedData.resources} 
            onChange={(value) => handleFieldChange('resources', value)}
            multiline 
          /> in my hands—these are my sources of confidence and strength as I move forward.
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          I don't need to wait until I'm "fully ready." The best moment to start is right now. Next, I'll <EditableField 
            value={editedData.nextStep} 
            onChange={(value) => handleFieldChange('nextStep', value)}
          />, beginning with this first step and letting the momentum carry me onward.
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          I understand that as long as I commit to <EditableField 
            value={editedData.dailyTask} 
            onChange={(value) => handleFieldChange('dailyTask', value)}
          /> each day, little by little, I'll steadily move closer to the goal I'm eager to achieve.
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          When I close my eyes, I clearly see this image: [Vision Image]. It's not just a vision of my desired outcome; it's the driving force that moves me forward today.
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          Every time I complete my daily milestone, I'll reward myself with something small and meaningful: <EditableField 
            value={editedData.dailyReward} 
            onChange={(value) => handleFieldChange('dailyReward', value)}
          />. When I fully accomplish my goal, I'll celebrate this journey by treating myself to <EditableField 
            value={editedData.ultimateReward} 
            onChange={(value) => handleFieldChange('ultimateReward', value)}
          />, as recognition for what I've achieved.
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          I've set a deadline for myself: {new Date(editedData.targetDate).toLocaleDateString()}. I know there might be ups and downs along the way, but I deeply believe I have enough resources and strength to keep going.
        </Typography>
        
        <Typography className={styles.paragraph} variant="body1">
          Because the path is already beneath my feet—it's really not that complicated. All I need to do is stay focused and adjust my pace when needed ^^.
        </Typography>
      </div>
    );
  };
  
  // 保存宣言
  const handleSave = async () => {
    if (!goal) return;
    
    try {
      setIsSaving(true);
      setError('');
      
      // 准备更新数据
      const updatedGoal = {
        title: editedData.title,
        details: {
          ...goal.details,
          motivation: editedData.motivation,
          resources: editedData.resources,
          nextStep: editedData.nextStep,
          ultimateReward: editedData.ultimateReward,
        },
        currentSettings: {
          ...goal.currentSettings,
          dailyTask: editedData.dailyTask,
          dailyReward: editedData.dailyReward,
        },
        targetDate: editedData.targetDate,
        declaration: {
          content: generateDeclarationText(editedData),
          updatedAt: new Date()
        }
      };
      
      const result = await onSave(goal._id || goal.id, updatedGoal);
      
      // 如果保存成功，立即更新本地数据显示
      if (result && result.data) {
        // 临时合并更新的数据以立即显示
        const updatedContent = updatedGoal.declaration.content;
        goal.declaration = {
          ...goal.declaration,
          content: updatedContent,
          updatedAt: new Date()
        };
      }
      
      setIsEditing(false);
      setSuccess('目标宣言已成功更新');
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('保存宣言失败:', err);
      setError('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSaving && onClose()}
      maxWidth="md"
      fullWidth
      classes={{ paper: styles.dialogPaper }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogContent className={styles.dialogContent}>
        {/* 头部按钮 */}
        <div className={styles.header}>
          <IconButton className={styles.closeButton} onClick={onClose} disabled={isSaving}>
            <CloseIcon />
          </IconButton>
          
          {!isEditing && (
            <IconButton 
              className={styles.editButton} 
              onClick={() => setIsEditing(true)} 
              disabled={isSaving}
            >
              <EditIcon />
            </IconButton>
          )}
          
          {isEditing && (
            <>
              <IconButton 
                className={styles.cancelButton} 
                onClick={() => setIsEditing(false)} 
                disabled={isSaving}
              >
                <CancelIcon />
              </IconButton>
              
              <IconButton 
                className={styles.saveButton} 
                onClick={handleSave} 
                disabled={isSaving}
                color="primary"
              >
                <CheckCircleIcon />
              </IconButton>
            </>
          )}
        </div>
        
        {/* 宣言图标 */}
        <div className={styles.declarationIcon}>
          <MenuBookIcon className={styles.bookIcon} />
        </div>
        
        {/* 错误提示 */}
        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}
        
        {/* 成功提示 */}
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" className={styles.alert}>
              {success}
            </Alert>
          </Fade>
        )}
        
        {/* 加载指示器 */}
        {isSaving && (
          <Box className={styles.loadingContainer}>
            <CircularProgress size={24} />
            <Typography variant="body2" className={styles.loadingText}>
              保存中...
            </Typography>
          </Box>
        )}
        
        {/* 宣言内容 */}
        <div className={styles.contentContainer}>
          {isEditing ? (
            renderEditableDeclaration()
          ) : (
            <div className={styles.declaration}>
              {goal?.declaration?.content ? (
                formatDeclarationContent(goal.declaration.content)
              ) : (
                <Box className={styles.emptyState}>
                  <Typography variant="body1">
                    这个目标还没有正式的宣言。点击编辑按钮可以生成宣言。
                  </Typography>
                </Box>
              )}
            </div>
          )}
        </div>
        
        {/* 底部按钮 */}
        <Box className={styles.actionButtons}>
          {isEditing && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={isSaving}
              startIcon={<CheckCircleIcon />}
            >
              {isSaving ? '保存中...' : '确认保存'}
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
} 