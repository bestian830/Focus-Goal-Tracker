# 目标宣言组件实现方案

## 一、功能概述

目标宣言组件(GoalDeclaration)将作为一个独立组件，用于展示用户的目标宣言并提供编辑功能。这个组件将在GoalDetails页面中作为一个可点击的图标入口，点击后打开一个模态对话框展示完整的宣言内容。

主要功能包括：
1. 以优雅、正式的方式展示用户的目标宣言
2. 提供编辑功能，允许用户修改宣言中的关键内容
3. 保存修改并更新数据库
4. 与现有的Goal数据模型无缝集成

## 二、用户界面设计

### 1. 入口按钮设计

在GoalDetails页面中添加一个文档图标按钮：
- 位置：右侧区域，与删除按钮垂直对齐
- 图标：MUI的文档图标(DocumentIcon)或书籍图标(MenuBookIcon)
- 悬停效果：显示提示文本"查看目标宣言"
- 点击效果：打开宣言模态框

### 2. 宣言展示模态框

- 背景：半透明遮罩，突出显示宣言内容
- 容器：白色背景的卡片，有适当阴影和边距
- 模态框尺寸：根据内容自适应，最小高度60vh，最大高度90vh
- 关闭按钮：右上角X图标
- 编辑按钮：右上角羽毛笔图标(EditIcon)
- 宣言内容：使用优雅的排版，包括标题、正文和签名区域

### 3. 编辑模式

- 触发：点击编辑按钮
- 视觉反馈：可编辑字段高亮显示
- 交互方式：点击高亮区域直接编辑
- 保存按钮：底部的确认按钮(蓖章图标 - ApprovalIcon)
- 取消按钮：返回查看模式的按钮

## 三、数据结构设计

### 1. 组件Props设计

```javascript
interface GoalDeclarationProps {
  goal: Goal;               // 完整的目标对象
  isOpen: boolean;          // 控制模态框显示
  onClose: () => void;      // 关闭回调
  onSave: (updatedGoal: Partial<Goal>) => Promise<void>; // 保存回调
}
```

### 2. 内部状态管理

```javascript
// 编辑状态
const [isEditing, setIsEditing] = useState(false);

// 临时存储编辑中的数据
const [editedData, setEditedData] = useState({
  title: goal.title,
  motivation: goal.details?.motivation || '',
  resources: goal.details?.resources || '',
  nextStep: goal.details?.nextStep || '',
  dailyTask: goal.currentSettings?.dailyTask || '',
  dailyReward: goal.currentSettings?.dailyReward || '',
  ultimateReward: goal.details?.ultimateReward || '',
  targetDate: goal.targetDate || new Date(),
});

// 保存中状态
const [isSaving, setIsSaving] = useState(false);

// 错误信息
const [error, setError] = useState('');
```

## 四、技术实现细节

### 1. 组件结构

```
GoalDetails/
  ├── GoalDeclaration.jsx      // 主宣言组件
  ├── GoalDeclaration.module.css // 样式文件
  ├── EditableField.jsx        // 可编辑字段子组件
  └── DeclarationRenderer.jsx  // 宣言渲染子组件(可选)
```

### 2. 宣言渲染逻辑

```javascript
// 使用模板字符串生成完整宣言
const renderDeclaration = (goal, editMode = false) => {
  const declarationContent = goal.declaration?.content;
  
  // 如果有已保存的宣言内容并且不是编辑模式，直接使用
  if (declarationContent && !editMode) {
    return formatDeclarationContent(declarationContent);
  }
  
  // 否则从单独字段重新生成
  const {
    title,
    details,
    currentSettings,
    targetDate
  } = goal;
  
  // 格式化日期
  const formattedDate = targetDate ? 
    new Date(targetDate).toLocaleDateString() : '';
  
  // 构建宣言文本
  return (
    <div className={styles.declaration}>
      <h2 className={styles.title}>
        {editMode ? 
          <EditableField 
            value={editedData.title} 
            onChange={(val) => updateEditedData('title', val)}
          /> : 
          title
        }
      </h2>
      
      <p className={styles.paragraph}>
        This goal isn't just another item on my list—it's something I genuinely want to achieve
      </p>
      
      <p className={styles.paragraph}>
        I'm stepping onto this path because{' '}
        {editMode ? 
          <EditableField 
            value={editedData.motivation} 
            onChange={(val) => updateEditedData('motivation', val)}
          /> : 
          details?.motivation
        }. It's something deeply meaningful to me, a desire that comes straight from my heart.
      </p>
      
      {/* 其余宣言内容以类似方式渲染 */}
      ...
    </div>
  );
};
```

### 3. 可编辑字段实现

```javascript
// EditableField.jsx
const EditableField = ({ value, onChange, multiline = false }) => {
  const [fieldValue, setFieldValue] = useState(value);
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
    <span 
      className={`${styles.editableField} ${isFocused ? styles.editing : ''}`}
    >
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
```

### 4. 保存逻辑

```javascript
const handleSave = async () => {
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
    };
    
    // 重新生成宣言内容
    const newDeclarationContent = generateDeclarationText(updatedGoal);
    updatedGoal.declaration = {
      content: newDeclarationContent,
      updatedAt: new Date()
    };
    
    // 调用API保存
    await onSave(updatedGoal);
    
    // 退出编辑模式
    setIsEditing(false);
    
    // 显示成功消息
    toast.success('目标宣言已更新');
  } catch (error) {
    console.error('保存宣言失败:', error);
    setError('保存失败，请重试');
  } finally {
    setIsSaving(false);
  }
};
```

### 5. 图片处理

VisionImage处理比较复杂，需要特别注意：

1. **展示处理**:
   - 在宣言中以文本描述提及图片："When I close my eyes, I clearly see this image: [Vision Image]"
   - 可以考虑在此处实际显示图片，但仅限于查看模式，编辑模式不直接修改图片

2. **编辑处理**:
   - 在编辑模式下，提供单独的图片编辑选项
   - 使用与VisionStep相同的上传逻辑，但界面更简化
   - 可以仅提供"更改图片"按钮，点击后调用简化版的图片上传组件

```javascript
// 图片编辑区域示例
const ImageEditSection = ({ currentImageUrl, onImageChange }) => {
  const [showUploader, setShowUploader] = useState(false);
  
  return (
    <div className={styles.imageEditSection}>
      {currentImageUrl && (
        <img 
          src={currentImageUrl} 
          alt="Vision" 
          className={styles.visionThumbnail}
        />
      )}
      
      <Button 
        variant="outlined" 
        size="small"
        onClick={() => setShowUploader(true)}
      >
        {currentImageUrl ? '更改图片' : '添加图片'}
      </Button>
      
      {showUploader && (
        <SimpleImageUploader
          onImageSelected={onImageChange}
          onCancel={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};
```

3. **方案建议**:
   - 考虑到复杂性，可以在第一版实现中不直接修改图片
   - 在后续迭代中再添加完整的图片编辑功能
   - 或者提供一个简单的链接，引导用户到专门的图片编辑页面

## 五、API交互设计

### 1. 更新目标宣言

使用现有的goal更新API，但只更新必要字段：

```javascript
// 保存宣言更改
const saveDeclaration = async (goalId, updatedData) => {
  try {
    // 调用API服务
    const response = await apiService.goals.update(goalId, {
      title: updatedData.title,
      details: updatedData.details,
      currentSettings: updatedData.currentSettings,
      targetDate: updatedData.targetDate,
      declaration: updatedData.declaration
    });
    
    return response.data;
  } catch (error) {
    console.error('更新宣言失败:', error);
    throw error;
  }
};
```

### 2. 图片上传集成

如果实现图片编辑，需要重用VisionStep中的图片上传逻辑：

```javascript
// 简化版图片上传
const uploadVisionImage = async (file) => {
  try {
    // 创建表单数据
    const formData = new FormData();
    formData.append('file', file);
    
    // 发送到后端API
    const uploadRes = await axios.post('/api/uploads/direct', file, { 
      baseURL: apiService.getDiagnostics().apiUrl,
      withCredentials: true,
      headers: {
        'Content-Type': file.type
      }
    });
    
    // 返回优化URL
    return uploadRes.data.data.optimized_url;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
};
```

## 六、样式设计

### 1. 主要样式规范

```css
/* GoalDeclaration.module.css */
.modalContainer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modalContent {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 800px;
  min-height: 60vh;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  padding: 30px;
}

.declaration {
  font-family: 'Georgia', serif;
  color: #333;
  line-height: 1.6;
}

.title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.paragraph {
  margin-bottom: 1.2rem;
  font-size: 1.1rem;
}

.editableField {
  display: inline-block;
  padding: 2px 4px;
  border-radius: 3px;
  position: relative;
}

.editing {
  background-color: rgba(66, 133, 244, 0.1);
  border: 1px solid #4285f4;
}

.editInput {
  width: 100%;
  background: transparent;
  border: none;
  font: inherit;
  color: inherit;
  outline: none;
}

.actionButtons {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.saveButton {
  background: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.closeButton, .editButton {
  position: absolute;
  top: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.closeButton {
  right: 15px;
}

.editButton {
  right: 50px;
}
```

### 2. 响应式设计

```css
/* 响应式样式 */
@media (max-width: 768px) {
  .modalContent {
    width: 95%;
    padding: 20px;
  }
  
  .title {
    font-size: 1.6rem;
  }
  
  .paragraph {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .modalContent {
    padding: 15px;
  }
  
  .title {
    font-size: 1.4rem;
  }
}
```

## 七、实施计划

### 1. 开发阶段

1. **准备工作**:
   - 确认Goal模型已经包含所需字段
   - 确认API服务支持目标更新功能

2. **组件开发**:
   - 创建基础GoalDeclaration组件
   - 实现查看模式与编辑模式切换
   - 开发可编辑字段组件
   - 集成保存功能

3. **集成阶段**:
   - 在GoalDetails中添加宣言图标入口
   - 连接组件与现有数据流
   - 添加交互功能和过渡动画

### 2. 测试策略

- **单元测试**: 验证宣言生成和字段编辑逻辑
- **集成测试**: 确保与Goal数据模型和API正确交互
- **用户体验测试**: 验证编辑流程的易用性

### 3. 部署注意事项

- 确保Cloudinary配置正确，支持图片上传
- 监控宣言保存API的性能和错误率
- 考虑添加分析，追踪宣言查看和编辑频率

## 八、后续优化建议

1. **富文本编辑**:
   - 未来可考虑支持更丰富的文本格式化
   - 添加简单的富文本编辑器

2. **宣言模板**:
   - 提供多种宣言模板供用户选择
   - 允许用户自定义宣言结构

3. **分享功能**:
   - 添加导出为PDF或图片功能
   - 提供社交媒体分享选项

4. **版本历史**:
   - 跟踪宣言的编辑历史
   - 允许查看和恢复以前的版本

5. **AI辅助**:
   - 集成AI建议，帮助用户改进宣言内容
   - 提供写作提示和智能完成

## 总结

GoalDeclaration组件将为用户提供一个正式、优雅的方式来查看和编辑他们的目标宣言。通过直观的界面和无缝的编辑体验，用户可以反思和调整他们的目标，增强他们的承诺和动力。实现这个组件将大大提升应用的专业感和用户体验。 