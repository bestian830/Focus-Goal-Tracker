# 移动优先响应式设计实现指南

## 概述

本文档描述了应用程序的移动优先响应式设计实现方案。根据屏幕宽度，我们将布局分为三个主要断点：

- **移动设备**: < 600px - 单列布局
- **平板设备**: 600px - 900px - 两列布局  
- **桌面设备**: > 900px - 三列布局

## 核心原则

- 采用**移动优先**的设计方法，先设计移动端布局，再通过媒体查询添加更复杂的布局
- 使用语义化HTML结构
- 使用Flexbox和Grid布局实现灵活的响应式组件
- 确保所有组件在各种屏幕尺寸下都可用和易用

## 详细实现

### CSS结构与命名规范

我们将使用min-width媒体查询实现移动优先设计，而不是max-width：

```css
/* 移动设备基础样式 - 默认 */
.component { ... }

/* 平板设备 */
@media (min-width: 600px) { ... }

/* 桌面设备 */
@media (min-width: 900px) { ... }
```

### 布局方案

#### 移动设备 (< 600px)

单列布局，组件从上到下按以下顺序排列：

1. Sidebar (目标列表)
2. GoalDetails (目标详情)
3. ProgressReport (进度报告)

**实现代码**:

```css
/* 移动端默认样式 - 单列布局 */
.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  padding: 12px;
}

/* 确保三个主要组件占满宽度并垂直堆叠 */
.main-content > :nth-child(1),
.main-content > :nth-child(2),
.main-content > :nth-child(3) {
  width: 100%;
  margin-bottom: 16px;
}

/* 移除桌面端特有的边框 */
.main-content > :nth-child(2) {
  border-left: none;
  border-right: none;
}
```

#### 平板设备 (600px - 900px)

两列布局：

- 左侧: Sidebar (目标列表)
- 右侧: GoalDetails与ProgressReport上下布局

**实现代码**:

```css
/* 平板布局 - 两列 */
@media (min-width: 600px) {
  .main-content {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px;
    gap: 20px;
  }
  
  /* 左侧Sidebar */
  .main-content > :nth-child(1) {
    width: 220px;
    flex: 0 0 220px;
  }
  
  /* 右侧容器 */
  .right-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0; /* 允许内容缩小 */
    gap: 20px;
  }
  
  /* GoalDetails与ProgressReport上下布局 */
  .main-content > :nth-child(2),
  .main-content > :nth-child(3) {
    width: 100%;
  }
}
```

#### 桌面设备 (> 900px)

三列布局，保持当前设计：

- 左侧: Sidebar (15%)
- 中间: GoalDetails (60%)
- 右侧: ProgressReport (25%)

但需要调整ProgressReport的padding：

**实现代码**:

```css
/* 桌面布局 - 三列 */
@media (min-width: 900px) {
  .main-content {
    flex-direction: row;
    flex-wrap: nowrap;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  /* Sidebar - 15% */
  .main-content > :nth-child(1) {
    flex: 0 0 15%;
    max-width: 15%;
  }
  
  /* GoalDetails - 60% */
  .main-content > :nth-child(2) {
    flex: 0 0 60%;
    max-width: 60%;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
  }
  
  /* ProgressReport - 25% */
  .main-content > :nth-child(3) {
    flex: 0 0 25%;
    max-width: 25%;
  }
  
  /* 调整ProgressReport的内边距 */
  ._reportContainer_hyxpf_2.MuiBox-root.css-1297fjn {
    padding: 12px;
  }
}
```

### 组件级别调整

#### GoalCard 组件

确保GoalCard在不同屏幕尺寸下有合适的布局：

```css
/* 移动设备基础样式 */
.goalCard {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.goalTitle {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 平板设备 */
@media (min-width: 600px) {
  .goalTitle {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
}

/* 桌面设备 - 三列布局 */
@media (min-width: 900px) {
  .goalTitle {
    display: grid;
    grid-template-columns: 15% 60% 25%;
    align-items: center;
  }
}
```

#### DailyCard 组件

确保日期卡片在各屏幕尺寸下有良好的可用性：

```css
/* 移动设备基础样式 */
.cardContainer {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

/* 平板设备 */
@media (min-width: 600px) {
  .cardContainer {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
  }
}

/* 桌面设备 */
@media (min-width: 900px) {
  .cardContainer {
    grid-template-columns: repeat(7, 1fr);
    gap: 20px;
  }
  
  /* 设置Daily Card弹出窗口的最大宽度 */
  .dialogContent {
    max-width: 800px;
  }
}
```

## 实施步骤

1. 修改 `GlobalStyles.css` 和 `Home.css` 中的主要布局样式，采用移动优先方法
2. 更新各组件的模块化CSS，确保符合移动优先原则
3. 添加适当的HTML结构支持布局变化，特别是平板设备的右侧容器
4. 为ProgressReport组件添加特定样式，调整内边距

## 测试计划

对以下设备进行测试：
- 小屏手机 (320px - 375px)
- 大屏手机 (376px - 599px)
- 平板设备 (600px - 900px)
- 小屏桌面 (901px - 1200px)
- 大屏桌面 (> 1200px)

确保各组件在所有尺寸下都能正常显示和交互。 