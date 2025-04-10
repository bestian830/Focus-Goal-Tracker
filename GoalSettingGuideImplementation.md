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

## 八、目標描述(Description)欄位在數據流中的問題分析

### 1. 問題現象
當用戶通過 GoalSettingGuide 組件完成目標設置流程時，目標的 description 欄位在保存到數據庫後顯示為空或不正確的內容，而不是預期的生成描述。

### 2. 數據流程檢查
根據檢查的代碼，我們已經發現了幾個可能導致這個問題的環節：

#### a. 數據產生階段
- `GoalSettingGuide.jsx` 在最終提交前正確地生成了 description：
  ```javascript
  // 生成详细描述
  const generatedDescription = `我想要${goalData.title}，因为${goalData.motivation}。`;
  
  // 確保所有必要的字段都有值
  const finalGoalData = {
    ...goalData,
    description: generatedDescription,
  };
  ```
  日誌顯示這部分代碼有執行，並且生成了包含正確 description 的 finalGoalData 對象。

#### b. 數據傳遞階段
- `GoalSettingGuide` 將 finalGoalData 傳遞給 `onComplete` 函數 (在 `OnboardingModal` 中定義)
- `OnboardingModal` 在 `handleGoalSubmit` 中接收這個數據，並添加 userId 等字段後傳遞給 API

#### c. 數據保存階段
- `apiService.goals.createGoal` 接收完整數據並發送到後端
- 後端 `goalsController.js` 中的 `createGoal` 函數處理請求

### 3. 可能的問題原因

1. **數據結構映射問題**：
   - 前端和後端使用的對象屬性名稱可能不匹配
   - `GoalSettingGuide` 產生的 description 字段可能在提交到後端時丟失或重命名

2. **API 數據處理問題**：
   - 在 `apiService.js` 的 `goals.createGoal` 方法中可能沒有正確傳遞 description 字段
   - 將 description 和 motivation 欄位混淆或覆蓋

3. **後端數據處理問題**：
   - 在 `goalsController.js` 的 `createGoal` 函數中沒有正確從請求體中讀取 description
   - 由於某種驗證或轉換邏輯，description 被忽略或重置

4. **數據顯示問題**：
   - `GoalDetails.jsx` 中顯示 description 時可能使用了錯誤的屬性名稱
   - 顯示邏輯可能優先從另一個屬性獲取內容，而非 description

### 4. 解決方案建議

1. **檢查數據傳遞流程**：
   - 在 `OnboardingModal.jsx` 的 `handleGoalSubmit` 中添加詳細日誌，確認 description 字段存在並正確
   - 在 API 調用前後都記錄完整的目標數據，以確定數據何時丟失

2. **檢查後端處理邏輯**：
   - 確認 `goalsController.js` 中的 `createGoal` 函數正確使用請求中的 description 字段
   - 檢查是否有任何邏輯會覆蓋或移除 description 值

3. **前後端數據模型同步**：
   - 重新檢查 Goal 模型的定義，確保 description 是必需字段且正確定義
   - 確保前端的目標數據對象結構與後端模型一致

4. **增強錯誤處理**：
   - 在保存過程中添加更多驗證和錯誤處理，確保必需字段不會丟失
   - 如果 description 為空，使用替代值或根據其他字段動態生成

5. **狀態管理改進**：
   - 考慮使用 Zustand 或 Redux 等狀態管理工具，取代手動的 props 傳遞
   - 這樣可以確保數據在不同組件間的一致性，減少傳遞錯誤

### 5. 實施計劃
1. 添加日誌以跟踪數據流
2. 修復數據傳遞和處理邏輯中的問題
3. 加強前後端數據模型的一致性
4. 改進 UI 顯示邏輯，確保正確渲染 description
5. 添加單元測試以驗證數據流程 