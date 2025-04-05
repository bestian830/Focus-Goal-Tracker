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
  Fade,
  TextField,
  Input
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ImageIcon from '@mui/icons-material/Image';
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
  const [imagePreview, setImagePreview] = useState('');
  const [editedData, setEditedData] = useState({
    title: '',
    motivation: '',
    resources: '',
    nextStep: '',
    dailyTask: '',
    dailyReward: '',
    ultimateReward: '',
    targetDate: null,
    visionImage: null
  });
  
  // 当目标数据改变时，更新编辑数据
  useEffect(() => {
    try {
      if (goal) {
        console.log("GoalDeclaration组件收到新的目标数据:", goal);
        
        // 记录当前宣言状态，便于调试
        console.log("当前宣言状态:", goal.declaration);
        
        // 重置编辑模式 - 默认总是进入查看模式
        setIsEditing(false);
        
        // 从目标对象中获取数据用于编辑模式
        setEditedData({
          title: goal.title || '',
          motivation: goal.details?.motivation || '',
          resources: goal.details?.resources || '',
          nextStep: goal.details?.nextStep || '',
          dailyTask: goal.currentSettings?.dailyTask || '',
          dailyReward: goal.currentSettings?.dailyReward || '',
          ultimateReward: goal.details?.ultimateReward || '',
          targetDate: goal.targetDate ? new Date(goal.targetDate) : new Date(),
          visionImage: goal.details?.visionImage || null
        });
      }
    } catch (error) {
      console.error("更新编辑数据失败:", error);
      // 设置安全的默认值
      setEditedData({
        title: goal?.title || '',
        motivation: '',
        resources: '',
        nextStep: '',
        dailyTask: '',
        dailyReward: '',
        ultimateReward: '',
        targetDate: new Date(),
        visionImage: null
      });
    }
  }, [goal, isOpen]);
  
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
      targetDate,
      visionImage
    } = data;
    
    const username = 'User'; // 可以根据实际情况获取
    const formattedDate = targetDate ? new Date(targetDate).toLocaleDateString() : '';
    const visionImagePlaceholder = visionImage ? '[Vision Image Attached]' : '[No Vision Image Yet]';
    
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
  
  // 格式化宣言内容，加粗显示变量
  const formatDeclarationContent = (content) => {
    if (!content) return null;
    
    try {
      // 检查是否包含Vision Image段落
      const hasVisionParagraph = content.includes('I clearly see this image');
      const visionImageExists = goal?.details?.visionImage;
      
      // 分段处理宣言内容
      return content.split('\n\n').map((paragraph, index) => {
        // 检查是否为Vision Image段落
        if (paragraph.includes('I clearly see this image')) {
          return (
            <div key={index} className={styles.visionParagraph}>
              <Typography className={styles.paragraph} variant="body1">
                When I close my eyes, I clearly see this image:
              </Typography>
              
              {visionImageExists ? (
                <Box className={styles.declarationImageContainer}>
                  <img 
                    src={goal.details.visionImage} 
                    alt="目标愿景" 
                    className={styles.declarationImage} 
                  />
                </Box>
              ) : (
                <Typography className={styles.paragraph} variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  [尚未设置愿景图像]
                </Typography>
              )}
              
              <Typography className={styles.paragraph} variant="body1">
                It's not just a vision of my desired outcome; it's the driving force that moves me forward today.
              </Typography>
            </div>
          );
        }
        
        // 检查段落中是否包含变量
        let formattedParagraph = paragraph;
        
        // 处理可能存在的变量字段
        const variablePatterns = [
          // 检测模式可能存在的变量，用正则表达式来匹配
          { regex: /stepping onto this path because (.*?)\./, group: 1 }, // motivation
          { regex: /I already hold (.*?) in my hands/, group: 1 }, // resources
          { regex: /Next, I'll (.*?),/, group: 1 }, // nextStep
          { regex: /I commit to (.*?) each day/, group: 1 }, // dailyTask
          { regex: /something small and meaningful: (.*?)\./, group: 1 }, // dailyReward
          { regex: /treating myself to (.*?),/, group: 1 }, // ultimateReward
          { regex: /deadline for myself: (.*?)\./, group: 1 }, // targetDate
          { regex: /I clearly see this image: \[(.*?)\]/, group: 1 }, // visionImage
        ];
        
        // 应用变量检测和样式替换
        variablePatterns.forEach(pattern => {
          const match = formattedParagraph.match(pattern.regex);
          if (match && match[pattern.group]) {
            const variable = match[pattern.group];
            formattedParagraph = formattedParagraph.replace(
              match[0],
              match[0].replace(
                variable,
                `<span class="${styles.variableValue}">${variable}</span>`
              )
            );
          }
        });
        
        // 如果包含变量，使用dangerouslySetInnerHTML来显示
        if (formattedParagraph !== paragraph) {
          return (
            <Typography 
              key={index} 
              className={styles.paragraph} 
              variant="body1"
              dangerouslySetInnerHTML={{ __html: formattedParagraph }}
            />
          );
        }
        
        // 否则正常显示
        return (
          <Typography key={index} className={styles.paragraph} variant="body1">
            {paragraph}
          </Typography>
        );
      });
    } catch (error) {
      console.error("格式化宣言内容失败:", error);
      // 如果分段失败，至少显示原始内容
      return (
        <Typography className={styles.paragraph} variant="body1">
          {content}
        </Typography>
      );
    }
  };
  
  // 处理图片上传
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      handleFieldChange('visionImage', reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 移除图片
  const handleRemoveImage = () => {
    setImagePreview('');
    handleFieldChange('visionImage', null);
  };
  
  // 渲染编辑模式的宣言
  const renderEditableDeclaration = () => {
    if (!goal) {
      return (
        <Box className={styles.emptyState}>
          <Typography variant="body1">
            无法加载目标数据，请稍后再试。
          </Typography>
        </Box>
      );
    }
    
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
        
        <div className={styles.visionParagraph}>
          <Typography className={styles.paragraph} variant="body1">
            When I close my eyes, I clearly see this image:
          </Typography>
          
          {/* Vision Image上传与预览 */}
          <Box className={styles.visionImageSection}>
            {imagePreview || editedData.visionImage ? (
              <Box className={styles.imagePreviewContainer}>
                <img 
                  src={imagePreview || editedData.visionImage} 
                  alt="愿景图像" 
                  className={styles.imagePreview} 
                />
                <IconButton 
                  className={styles.removeImageBtn}
                  onClick={handleRemoveImage}
                  size="small"
                >
                  <CancelIcon />
                </IconButton>
              </Box>
            ) : (
              <Box className={styles.uploadImageBox}>
                <Input
                  type="file"
                  id="vision-image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="vision-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                    className={styles.uploadButton}
                  >
                    上传愿景图像
                  </Button>
                </label>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  添加一张能代表你目标愿景的图片
                </Typography>
              </Box>
            )}
          </Box>
          
          <Typography className={styles.paragraph} variant="body1">
            It's not just a vision of my desired outcome; it's the driving force that moves me forward today.
          </Typography>
        </div>
        
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
    if (!goal) {
      setError('保存失败: 无法获取目标数据');
      return;
    }
    
    try {
      setIsSaving(true);
      setError('');
      
      console.log("开始准备宣言数据...");
      
      // 准备更新数据
      const updatedGoal = {
        title: editedData.title,
        details: {
          ...(goal.details || {}),
          motivation: editedData.motivation,
          resources: editedData.resources,
          nextStep: editedData.nextStep,
          ultimateReward: editedData.ultimateReward,
          visionImage: editedData.visionImage
        },
        currentSettings: {
          ...(goal.currentSettings || {}),
          dailyTask: editedData.dailyTask,
          dailyReward: editedData.dailyReward,
        },
        targetDate: editedData.targetDate,
        declaration: {
          content: generateDeclarationText(editedData),
          updatedAt: new Date()
        }
      };
      
      // 确保有有效的目标ID
      const goalId = goal._id || goal.id;
      if (!goalId) {
        throw new Error('无效的目标ID');
      }
      
      try {
        console.log("调用API保存宣言数据...");
        const result = await onSave(goalId, updatedGoal);
        
        console.log("宣言保存成功，API返回结果:", result);
        
        // 退出编辑模式
        setIsEditing(false);
        
        // 显示成功消息
        setSuccess('目标宣言已成功更新');
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } catch (saveError) {
        console.error('API调用失败:', saveError);
        throw saveError;
      }
    } catch (err) {
      console.error('保存宣言失败:', err);
      setError(`保存失败: ${err.message || '请稍后重试'}`);
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
          {!goal ? (
            <Box className={styles.emptyState}>
              <Typography variant="body1">
                无法加载目标数据，请关闭并重试。
              </Typography>
            </Box>
          ) : isEditing ? (
            renderEditableDeclaration()
          ) : (
            <div className={styles.declaration}>
              {goal?.declaration?.content ? (
                formatDeclarationContent(goal.declaration.content)
              ) : (
                <Box className={styles.emptyState}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    您的目标还没有正式的宣言。
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    宣言能帮助您更好地理解目标意义和保持动力。点击下方按钮创建您的目标宣言。
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => setIsEditing(true)}
                    startIcon={<EditIcon />}
                  >
                    创建目标宣言
                  </Button>
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