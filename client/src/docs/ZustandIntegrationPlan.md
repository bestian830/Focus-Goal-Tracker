# Zustand集成计划

## 目标
将Focus应用从基于Props的状态管理升级为使用Zustand进行全局状态管理，以实现更高效、可扩展的代码组织。

## 关键文件
- `focus-app/client/src/store/goalStore.js` - Zustand存储定义
- `focus-app/client/src/components/GoalSettingGuide/*.jsx` - 目标设置向导组件
- `focus-app/client/src/components/GoalDeclaration/*.jsx` - 目标宣言组件
- `focus-app/client/src/components/DailyCard/*.jsx` - 每日卡片组件

## 实施计划

### 阶段一：基础设置与目标存储 ✓
1. 添加Zustand依赖 ✓
2. 创建基本goalStore结构 ✓
3. 实现goalStore的基本功能 ✓
   - 目标列表管理
   - 选定目标管理
   - 目标CRUD操作
   - 与API集成

### 阶段二：GoalSettingGuide组件集成 ✓
1. 修改GoalSettingGuide组件使用Zustand ✓
2. 修改所有步骤组件：
   - TitleStep ✓
   - MotivationStep ✓
   - ResourcesStep ✓
   - VisionStep ✓
   - RewardsStep ✓

### 阶段三：GoalDeclaration组件集成 ✓
1. 修改GoalDeclaration组件使用Zustand ✓
2. 实现宣言文本生成功能 ✓
3. 提供编辑和更新功能 ✓

### 阶段四：Review与优化
1. 在DailyCard中集成Zustand
2. 优化组件之间的数据流
3. 移除不必要的prop drilling
4. 添加适当的加载和错误状态处理

### 阶段五：测试计划
以下是需要测试的功能列表：

#### 5.1 Zustand存储功能测试
- [ ] 获取所有目标数据（`useGoalStore.getState().fetchGoals`）
- [ ] 获取单个目标（`useGoalStore.getState().getGoalById`）
- [ ] 创建新目标（`useGoalStore.getState().createGoal`）
- [ ] 更新现有目标（`useGoalStore.getState().updateGoal`）
- [ ] 删除目标（`useGoalStore.getState().deleteGoal`）
- [ ] 本地存储持久化功能（刷新页面后状态保持）
- [ ] 重置存储状态（`useGoalStore.getState().resetStore`）

#### 5.2 目标设置向导组件测试
- [ ] TitleStep字段验证和状态保存
- [ ] MotivationStep表单验证和字符限制
- [ ] ResourcesStep资源和步骤添加功能
- [ ] VisionStep图片上传和预览功能
- [ ] RewardsStep奖励设置和日期选择
- [ ] 整体向导的步骤导航和数据保存
- [ ] 表单验证错误处理
- [ ] 向导完成后目标创建过程

#### 5.3 目标宣言组件测试
- [ ] 基于存储数据生成宣言文本
- [ ] 宣言文本格式化和排版
- [ ] 编辑模式切换功能
- [ ] 宣言更新与保存
- [ ] 图片显示功能

#### 5.4 API集成测试
- [ ] API请求错误处理
- [ ] 网络延迟处理
- [ ] 未授权请求处理
- [ ] 服务器端数据验证错误处理

#### 5.5 跨组件集成测试
- [ ] 创建目标并在目标列表中显示
- [ ] 从列表选择目标并显示详情
- [ ] 更新目标并验证UI更新
- [ ] 删除目标并验证从列表移除

#### 5.6 性能测试
- [ ] 大量目标数据下的渲染性能
- [ ] 状态更新的响应时间
- [ ] 内存使用分析
- [ ] 重复渲染检查

## 完成标准
- 所有组件都使用Zustand进行状态管理，不再依赖prop drilling
- 所有API调用通过goalStore进行，提供统一的数据获取和更新机制
- 应用状态在刷新后仍能持久保存
- 所有测试项目通过，功能正常工作 