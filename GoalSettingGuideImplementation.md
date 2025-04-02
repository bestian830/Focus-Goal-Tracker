# 目标设置指南实现方案

## 一、功能概述

Focus应用将提供一个引导式的目标设置流程，帮助用户通过思考过程制定明确、可行的目标。这个引导流程将在以下情况触发：

1. 新用户首次注册并登录时
2. 临时用户(tempId)首次生成并登录时
3. 用户在首页点击"添加目标"按钮时

引导流程采用浮动窗口形式，包含5个连续页面，用户可通过"上一步"和"下一步"按钮导航，最终生成正式的目标宣言。

## 二、用户界面设计

### 1. 浮动窗口规范

- **显示方式**：Modal弹窗，背景半透明遮罩
- **关闭机制**：
  - 点击外部区域弹出确认消息："确定要离开吗？您的进度将会保存"
  - 确认离开后返回首页，临时数据将保存在localStorage
- **导航控件**：
  - 第1页：仅"下一步"按钮
  - 第2-4页："上一步"和"下一步"按钮
  - 第5页："上一步"和"确认保存"按钮

### 2. 页面内容

#### 页面1：确定目标
- 引导问题："我现在最想达成/完成的目标是什么？"
- 输入框：目标标题（限制100字符）
- 下一步按钮

#### 页面2：明确动机
- 引导问题："我想达成这个目标主要是因为..."
- 输入框：动机说明（建议300-500字符）
- 上一步和下一步按钮

#### 页面3：确认资源和计划
- 引导问题1："这个目标可以实现，因为我已经具备/将会获取以下资源或能力..."
- 输入框1：资源说明（建议300字符）
- 引导问题2："为实现这个目标，我现在可以做的一件事是..."
- 输入框2：下一步行动（建议100-200字符）
- 引导问题3："关于这个目标，我每天可以跟踪的一件事是..."
- 输入框3：每日任务/检查点（建议100字符）
- 上一步和下一步按钮

#### 页面4：愿景图片
- 引导信息："为这个目标选择一张能代表我愿景的图片"
- 图片上传区域（支持拖放、点击上传）
- 上一步和下一步按钮

#### 页面5：奖励与时间线
- 引导问题1："如果我完成每日任务，我会奖励自己..."
- 输入框1：日常奖励（建议100-200字符）
- 引导问题2："当我最终实现这个目标，我会奖励自己..."
- 输入框2：最终奖励（建议100-200字符）
- 引导问题3："我计划在此日期前实现这个目标..."
- 日期选择器
- 上一步和确认保存按钮

### 3. 目标宣言展示

- **触发时机**：用户完成5步流程并点击"确认保存"后
- **展示形式**：格式化的宣言文档，具有正式感的设计
- **编辑功能**：
  - 右上角提供关闭按钮和编辑按钮(使用MUI的编辑图标)
  - 编辑模式可修改各个部分，修改后需确认保存

## 三、数据结构设计

### 1. Goal模型扩展

基于现有Goal模型，增加以下字段：

```javascript
{
  // 现有字段保留
  userId: ...,
  title: ..., // 目标标题（goalTitle）
  description: ...,
  status: ...,
  priority: ...,
  targetDate: ..., // 用户设定的目标完成日期
  
  // 新增字段
  goalDetails: {
    motivation: String, // 动机（最多500字符）
    resources: String,  // 资源和能力（最多500字符）
    nextStep: String,   // 下一步行动（最多200字符）
    dailyTask: String,  // 每日任务（最多100字符）
    visionImageUrl: String, // 愿景图片URL（Cloudinary链接）
    dailyReward: String, // 日常奖励（最多200字符）
    ultimateReward: String // 最终奖励（最多200字符）
  },
  
  // 保留现有declaration字段，用于存储生成的宣言
  declaration: {
    content: String,
    updatedAt: Date
  },
  
  // checkpoints字段适当调整
  checkpoints: [
    {
      // 现有字段
      title: String,
      description: String,
      isCompleted: Boolean,
      completedAt: Date,
      
      // 新增字段
      isDaily: Boolean // 标识是否是每日任务
    }
  ]
}
```

### 2. 临时数据存储

在浏览器localStorage中保存表单进度：

```javascript
// 键名格式
const STORAGE_KEY = `goal_guide_draft_${userId || tempId}`;

// 存储结构
const draftData = {
  step: 1, // 当前进行到第几步
  title: '...',
  motivation: '...',
  resources: '...',
  nextStep: '...',
  dailyTask: '...',
  visionImageDataUrl: '...', // 临时存储图片(base64)
  dailyReward: '...',
  ultimateReward: '...',
  targetDate: '2023-12-31'
};
```

## 四、技术实现细节

### 1. 前端组件结构

```
GoalSettingGuide/
  ├── index.jsx          // 主容器组件
  ├── GuideModal.jsx     // 模态窗口组件
  ├── StepIndicator.jsx  // 步骤指示器
  ├── StepPages/         // 各步骤页面
  │   ├── Step1Title.jsx
  │   ├── Step2Motivation.jsx
  │   ├── Step3Resources.jsx
  │   ├── Step4Vision.jsx
  │   └── Step5Rewards.jsx
  ├── Declaration.jsx    // 宣言展示组件
  └── DeclarationEditor.jsx // 宣言编辑组件
```

### 2. 状态管理

使用React的Context API或Redux管理状态:

```javascript
// GoalGuideContext.js
const initialState = {
  isOpen: false,
  currentStep: 1,
  formData: { /* 初始表单数据 */ },
  showDeclaration: false
};

// 操作类型
const actions = {
  OPEN_GUIDE: 'OPEN_GUIDE',
  CLOSE_GUIDE: 'CLOSE_GUIDE',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  UPDATE_FORM: 'UPDATE_FORM',
  SAVE_GOAL: 'SAVE_GOAL',
  SHOW_DECLARATION: 'SHOW_DECLARATION',
  LOAD_DRAFT: 'LOAD_DRAFT'
};
```

### 3. 图片处理方案

采用Cloudinary进行图片存储：

1. **客户端预处理**:
   - 限制图片大小(建议1MB以内)
   - 提供简单的裁剪功能
   - 使用canvas进行初步压缩

2. **上传流程**:
   - 先将图片以base64格式存入localStorage
   - 在最终提交时上传至Cloudinary
   - 获取URL后替换base64数据并保存至MongoDB

3. **后端集成**:
   ```javascript
   // 服务器端Cloudinary配置
   import { v2 as cloudinary } from 'cloudinary';
   import streamifier from 'streamifier';
   
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });
   
   // 上传函数
   async function uploadToCloudinary(buffer) {
     return new Promise((resolve, reject) => {
       const uploadStream = cloudinary.uploader.upload_stream(
         { folder: 'goals' },
         (error, result) => {
           if (error) return reject(error);
           resolve(result.secure_url);
         }
       );
       streamifier.createReadStream(buffer).pipe(uploadStream);
     });
   }
   ```

### 4. 宣言生成逻辑

```javascript
function generateDeclaration(goalData) {
  const {
    title,
    motivation,
    resources,
    nextStep,
    dailyTask,
    visionImageUrl,
    dailyReward,
    ultimateReward,
    targetDate,
    username
  } = goalData;
  
  // 日期格式化
  const formattedDate = new Date(targetDate).toLocaleDateString();
  
  return `${title}

This goal isn't just another item on my list—it's something I genuinely want to achieve

I'm ${username}, and I'm stepping onto this path because ${motivation}. It's something deeply meaningful to me, a desire that comes straight from my heart.

I trust that I have what it takes, because I already hold ${resources} in my hands—these are my sources of confidence and strength as I move forward.

I don't need to wait until I'm "fully ready." The best moment to start is right now. Next, I'll ${nextStep}, beginning with this first step and letting the momentum carry me onward.

I understand that as long as I commit to ${dailyTask} each day, little by little, I'll steadily move closer to the goal I'm eager to achieve.

When I close my eyes, I clearly see this image: [Vision Image]. It's not just a vision of my desired outcome; it's the driving force that moves me forward today.

Every time I complete my daily milestone, I'll reward myself with something small and meaningful: ${dailyReward}. When I fully accomplish my goal, I'll celebrate this journey by treating myself to ${ultimateReward}, as recognition for what I've achieved.

I've set a deadline for myself: ${formattedDate}. I know there might be ups and downs along the way, but I deeply believe I have enough resources and strength to keep going.

Because the path is already beneath my feet—it's really not that complicated. All I need to do is stay focused and adjust my pace when needed ^^.`;
}
```

## 五、API端点设计

### 1. 目标创建接口增强

扩展现有的createGoal接口以支持新字段：

```javascript
// POST /api/goals
app.post('/api/goals', requireAuth, async (req, res) => {
  try {
    const {
      title, description, priority, targetDate,
      // 新增字段
      goalDetails, visionImageBase64
    } = req.body;
    
    let visionImageUrl = null;
    
    // 处理图片上传(如果有)
    if (visionImageBase64) {
      const buffer = Buffer.from(
        visionImageBase64.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
      visionImageUrl = await uploadToCloudinary(buffer);
    }
    
    // 生成宣言
    const declarationContent = generateDeclaration({
      ...goalDetails,
      title,
      targetDate,
      username: req.user.username || 'User',
      visionImageUrl
    });
    
    // 创建目标
    const newGoal = await Goal.create({
      userId: req.user.id,
      title,
      description,
      priority: priority || 'Medium',
      targetDate,
      goalDetails: {
        ...goalDetails,
        visionImageUrl
      },
      declaration: {
        content: declarationContent,
        updatedAt: new Date()
      },
      // 自动创建每日任务检查点
      checkpoints: [{
        title: goalDetails.dailyTask,
        description: '每日任务',
        isDaily: true
      }]
    });
    
    res.status(201).json({
      success: true,
      data: newGoal
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create goal',
        details: error.message
      }
    });
  }
});
```

### 2. 宣言更新接口

```javascript
// PUT /api/goals/:id/declaration
app.put('/api/goals/:id/declaration', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { declarationContent } = req.body;
    
    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: { message: 'Goal not found' }
      });
    }
    
    // 更新宣言
    goal.declaration = {
      content: declarationContent,
      updatedAt: new Date()
    };
    
    await goal.save();
    
    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error updating declaration:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update declaration',
        details: error.message
      }
    });
  }
});
```

## 六、实施计划

### 1. 前期准备
- 设置Cloudinary账户
- 添加必要的环境变量
- 更新Goal模型Schema

### 2. 开发阶段
1. **后端开发**
   - 扩展Goal模型
   - 实现Cloudinary集成
   - 添加新的API端点

2. **前端开发**
   - 创建引导流程UI组件
   - 实现本地存储逻辑
   - 开发宣言展示与编辑功能

3. **集成与测试**
   - 整合前后端功能
   - 测试数据流程
   - 确保流程完整可用

### 3. 部署与监控
- 确保环境变量配置正确
- 监控图片上传性能
- 追踪用户完成引导流程的比例

## 七、UI/UX注意事项

1. **可访问性**
   - 所有表单元素需有适当标签
   - 支持键盘导航
   - 文本应有足够对比度

2. **响应式设计**
   - 在移动设备上优化表单布局
   - 确保图片上传在移动设备上可用

3. **用户体验细节**
   - 添加进度指示器
   - 提供明确的错误提示
   - 自动保存功能避免数据丢失

4. **视觉设计**
   - 宣言展示需有正式感
   - 使用与应用主题一致的配色
   - 图标使用MUI库保持一致性 