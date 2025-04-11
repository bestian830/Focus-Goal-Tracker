# 2024-04-09 Goal Details & Daily Card Upgrade Summary

本次更新主要聚焦于解决 Goal Details 页面中 Daily Task Card 的任务勾选状态保存问题，并对相关组件的数据流和状态管理进行了优化。

## 问题背景

用户报告了以下主要问题：

1.  **任务勾选状态无法持久保存**：勾选 Daily Task 后，关闭再打开卡片，或点击 "Save Changes" 按钮后，勾选状态会丢失，恢复为未勾选。
2.  **"Save Changes" 行为异常**：单独勾选任务（不点击 "Save Changes"）直接关闭可以保存状态，但点击 "Save Changes" 后再打开，状态会丢失。
3.  **控制台警告/错误**：出现 "Card missing date" 警告，以及与 API 调用和状态更新相关的潜在问题。

## 核心问题分析

经过排查，发现问题主要由以下几个方面导致：

1.  **冗余/冲突的 API 调用**：`DailyCardRecord` 组件在勾选任务时 (`handleTaskStatusChange`) 会立即调用 API 保存，而其父组件 `WeeklyDailyCards` 在接收到更新通知后 (`handleCardUpdate`) 也可能再次调用 API，导致状态覆盖或冲突。(此问题已通过移除 `handleCardUpdate` 中的 API 调用解决)
2.  **错误的数据传递**：`DailyCardRecord` 的 `handleSave` 函数在点击 "Save Changes" 保存成功后，通过 `onSave` 回调传递的是服务器返回的**整个 Goal 对象**，而非**单个更新后的卡片对象**。这导致上层组件在处理状态更新时接收了错误格式的数据。(此问题已通过修改 `handleSave` 中的 `onSave` 调用解决)
3.  **对象引用与深拷贝问题**：JavaScript 对象是引用类型。在组件间传递卡片数据或更新状态时，如果没有使用深拷贝，可能导致多个部分共享同一对象引用，修改时互相影响，状态更新不正确。
4.  **新卡片初始化问题**：在 `WeeklyDailyCards` 组件中，为尚未有记录的日期生成新的卡片数据时，未正确初始化 `taskCompletions` 字段，导致该卡片无法记录任务状态。(此问题已通过在创建新卡片时添加 `taskCompletions: {}` 解决)
5.  **日期验证逻辑缺陷**：`validateCardData` 函数在处理缺少日期的卡片时，虽然添加了当前日期，但没有完全保留原始卡片的 `taskCompletions` 等重要状态，导致状态丢失。(此问题已通过修改 `validateCardData` 保留原始状态解决)

## 修复方案与代码修改

针对以上问题，进行了以下主要修改：

1.  **简化保存逻辑 (`WeeklyDailyCards.jsx`)**:
    *   移除了 `handleCardUpdate` 函数中的 API 调用 (`apiService.goals.addOrUpdateDailyCard`)，将保存职责完全交给 `DailyCardRecord`。
2.  **修正 `onSave` 回调数据 (`DailyCardRecord.jsx`)**:
    *   修改了 `handleSave` 函数，在 API 调用成功后，通过 `onSave(updatedCard)` 传递本地构建的、包含最新状态的**单个卡片对象**，与 `handleTaskStatusChange` 的行为保持一致。
3.  **强制使用深拷贝 (`DailyCardRecord.jsx`, `WeeklyDailyCards.jsx`, `GoalDetails.jsx`)**:
    *   在 `handleSave`, `handleTaskStatusChange`, `handleCardUpdate`, `handleDailyCardsUpdate` 等关键状态更新和传递环节，广泛使用 `JSON.parse(JSON.stringify(...))` 对卡片数据和 `taskCompletions` 对象进行深拷贝，确保数据独立性，避免引用冲突。
4.  **修复新卡片初始化 (`WeeklyDailyCards.jsx`)**:
    *   在生成新卡片数据时，明确添加了 `taskCompletions: {}`，确保新卡片可以正确记录任务状态。
5.  **完善日期验证逻辑 (`WeeklyDailyCards.jsx`)**:
    *   修改了 `validateCardData` 函数，在处理无效或缺失日期的卡片时，除了添加当前日期，还确保**保留原始卡片的 `taskCompletions`, `records`, `completed` 等状态**。
6.  **增强日志 (`*.jsx`, `goalsController.js`)**:
    *   在涉及状态更新、API 调用和回调的关键函数中添加了详细的 `console.log`，以便追踪数据流和调试。
7.  **服务器端优化 (`goalsController.js`)**:
    *   在 `addOrUpdateDailyCard` 函数中，处理 `taskCompletions` 时也使用了深拷贝，确保数据库层面正确更新。

## 主要涉及文件

*   `client/src/components/GoalDetails/DailyCardRecord.jsx`
*   `client/src/components/GoalDetails/WeeklyDailyCards.jsx`
*   `client/src/components/GoalDetails/GoalDetails.jsx`
*   `server/controllers/goalsController.js`

## 预期效果

本次更新后，预期 Daily Task 的勾选状态能够：

*   在勾选后立即通过 API 保存。
*   点击 "Save Changes" 按钮后能够正确持久化所有更改。
*   关闭并重新打开卡片详情时，能够正确显示之前保存的勾选状态。
*   消除了 "Card missing date" 等相关警告。
*   提高了数据流的稳定性和可预测性。