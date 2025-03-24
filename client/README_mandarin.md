# Focus Goal Tracker - 前端合併計劃

## 合併概述

本文檔記錄了前端代碼合併策略，主要解決兩位開發者不同的代碼結構和功能實現方式的整合。

## 合併策略

### 1. 文件結構

保留兩種結構的優點：
- `pages/` 目錄：保留完整的頁面和交互邏輯，包括用戶認證
- `components/` 目錄：保留模組化的 UI 組件

### 2. Home.jsx 合併策略

- **保留原有認證邏輯**：
  - 保留用戶狀態管理（`user`, `loading`, `showProfileModal`等）
  - 保留登出和模態框切換功能

- **保留原有 header 部分**：
  - 使用原始的 `<header className="app-header">` 代碼
  - 移除搭檔的 `<Header />` 組件引用

- **整合搭檔的組件**：
  - 在 `main-content` 中使用 `<Sidebar />`, `<GoalDetails />`, `<ProgressReport />` 組件
  - 保留條件渲染邏輯，僅在用戶登錄後顯示
  - 保留未登錄用戶的歡迎信息

- **保留 ProfileModal**：
  - 保留原有的個人資料模態框功能

### 3. Profile.jsx 處理

- 完全保留原有 `Profile.jsx` 文件
- 不使用搭檔的 `ProfileInfo` 和 `ChangePassword` 組件

### 4. CSS 樣式處理

- 保留 `styles/Home.css`：提供 header 樣式和整體布局
- 保留 `style/style.css`：提供搭檔組件所需的樣式
- 確保類名不衝突，特別是 `.home-container` 和 `.main-content`

## 具體實施步驟

1. 備份當前文件
2. 在 Home.jsx 中：
   - 保留原始的導入和狀態管理代碼
   - 添加搭檔的組件導入（Sidebar, GoalDetails, ProgressReport）
   - 在 return 部分使用上述合併策略
3. 刪除或備份多餘的 Header.jsx
4. 確保兩種 CSS 文件都被正確引用
5. 測試功能，確保所有功能（認證、頁面導航等）正常工作

## 注意事項

- 合併過程中保留了兩套 CSS，需要注意潛在的樣式衝突
- 功能測試重點：用戶登錄/登出、訪客訪問、Profile 功能、新組件的展示和交互
- 保留原有的 RWD 功能和用戶認證邏輯 