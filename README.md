# Focus - 智能目標追蹤系統

一個專注於幫助用戶設定、追蹤並實現個人目標的網站應用，基於 SMART 目標設定方法和願景心理學。

## 專案概述

Focus 是一個簡潔而強大的目標追蹤平台，旨在幫助用戶：

- 制定清晰、可衡量的目標
- 通過每日檢查點追蹤進度
- 獲得 AI 生成的週報與反饋
- 建立成就感和自信心

## 新建專案環境設定步驟

### 1. 創建專案基本結構

```bash
# 創建專案根目錄
mkdir focus-app
cd focus-app

# 初始化 Git 倉庫
git init

# 創建基本目錄結構
mkdir -p server/models server/routes server/controllers server/config
```

### 2. 設置後端 (Express + MongoDB) 並且等下安裝好 vite 後一起測試跟 MongoDB 的連線

`````bash
# 進入後端目錄
cd server

# 初始化 package.json, 後端的
npm init -y

# 安裝核心依賴
npm install express mongoose dotenv cors jsonwebtoken bcryptjs

# 安裝開發依賴
npm install --save-dev nodemon

# 創建 .env 文件
touch .env
```

#在 `.env` 文件中添加必要的環境變量：

```env
PORT=5050
MONGODB_URI=mongodb+srv://FocusFinalProject_team:<password>@cluster0.nxsur.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development

# JWT_SECRET=your_jwt_secret (skip first this line here)

````

在 `package.json` 中添加以下腳本：

```json
"scripts": {
    "start": "node server/server.js",
    "dev": "nodemon server/server.js"
}
```

改以下

```json
"main": "server/server.js",
```

# 在`server/config/db.js`(自己建立)

```db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🔥 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // when connection failed, exit the application
  }
};

module.exports = connectDB;

```
# 在 `server/server.js （自己建立以下內容）

```server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// load env variables
dotenv.config();

// connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;



// test API
app.get("/", (req, res) => {
  res.send("Hello from Express Server!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

```

### 3. 設置前端 (React + Vite)

```bash
# 返回到根目錄
cd ..

# 使用 Vite 創建 React 前端項目
npm create vite@latest client -- --template react
# above default setting : client, React, JS
# will suggest the following
# cd client, npm install, npm run dev

# 進入前端目錄
cd client

# 安裝依賴（前端的）
npm install

# 安裝其他前端依賴
npm install axios react-router-dom
```

修改 Vite 配置文件 `vite.config.js` 以支持代理:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

在 `package.json` 中確認腳本：

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

# 執行 npm run dev
應該可以以下console看到：
🚀 Server running on port 5050
🔥 MongoDB Connected: cluster0-shard-00-01.nxsur.mongodb.net


### 4. 設置 MongoDB (使用 Mongoose) 上面已經完成。

### 5. 設置根目錄 package.json 文件 (可選) （根目錄的）

```bash
# 返回根目錄
cd ..

# 初始化根目錄 package.json (在focus-ap)資料夾下方。
npm init -y
```

```bash
npm install --save-dev concurrently
# focus-app/package.json 同時管理前後端腳本

```


修改 `package.json` 以添加並發運行腳本：

```json
{
  "name": "focus-app",
  "scripts": {
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "install-all": "npm install && cd server && npm install && cd ../client && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

###
```bash

npm run install-all
# 確保client 前端 server 後端 相依都安裝正確。

npm run dev #啟動前後端

```


## 推薦專案結構

推薦使用的專案結構與截圖中所示類似，但稍微簡化：

```
focus-app/
├── server/                # 後端部分
│   ├── models/            # MongoDB 模型
│   │   ├── User.js        # 用戶模型 (users集合)
│   │   ├── Goal.js        # 目標模型 (goals集合)
│   │   ├── Progress.js    # 進度模型 (progress集合)
│   │   ├── Report.js      # 報告模型 (reports集合)
│   │   └── TempUser.js    # 臨時用戶模型 (temp_users集合)
│   ├── routes/            # API 路由
│   │   ├── auth.js
│   │   ├── goals.js
│   │   ├── users.js
│   │   └── ...
│   ├── controllers/       # 業務邏輯
│   ├── config/            # 配置文件
│   ├── server.js          # 主入口
│   └── .env               # 環境變量
│
├── client/                # 前端部分 (Vite + React)
│   ├── src/
│   │   ├── components/    # 可重用組件
│   │   ├── pages/         # 頁面組件
│   │   ├── services/      # API 服務
│   │   ├── App.jsx        # 主應用
│   │   └── main.jsx       # 入口文件
│   └── ...
```

此結構在保持清晰組織的同時簡化了一些不必要的複雜性，特別適合 MVP 階段的開發。

## 核心功能

### 目標管理

- 基於 SMART 原則的目標設定
- 同時追蹤最多 3 個優先級目標
- 個人化願景宣言
- 自定義檢查點

### 進度追蹤

- 每日任務完成記錄
- 進度筆記和反思
- 圖片上傳支持
- 心情記錄（可選）

### AI 智能分析

- 每週自動生成總結報告
- 基於用戶記錄的智能反饋
- 成就提醒和鼓勵
- 自我獎勵建議

## 技術棧

### 前端

- React.js (通過 Vite 構建)
- React Router
- Axios
- 可選: Tailwind CSS 或 Material UI

### 後端

- Node.js
- Express.js
- MongoDB
- Mongoose
- Nodemon (開發模式)

### 其他工具

- dotenv (環境變量管理)
- Mongoose (MongoDB ODM)
- JWT (身份驗證)

### 外部 API

- Google OAuth 2.0（用戶認證）
- OpenAI API（AI 驅動報告生成）

## 數據模型詳情

### 1. 用戶集合 (users)

主要字段:

- email: 用戶電子郵件 (唯一)
- googleId: Google 認證 ID
- username: 用戶名稱
- isGuest: 是否訪客
- goals: 關聯目標 ID 數組
- preferences: 用戶偏好設置
  - language: 語言偏好
  - timezone: 時區
  - notifications: 通知設置

### 2. 目標集合 (goals)

主要字段:

- userId: 關聯用戶 ID
- title: 目標標題
- description: 目標描述
- priority: 優先級 (1-3)
- status: 狀態 (active/completed/archived)
- targetDate: 目標日期
- progress: 關聯進度記錄 ID 數組
- declaration: 目標宣言
  - content: 宣言內容
  - vision: 願景
  - checkpoints: 檢查點數組

### 3. 進度集合 (progresses)

主要字段:

- goalId: 關聯目標 ID
- userId: 關聯用戶 ID
- date: 記錄日期
- records: 進度記錄數組
  - content: 內容
  - duration: 時長
  - mood: 心情
  - images: 圖片 URL 數組
- checkpoints: 檢查點完成狀態

### 4. 報告集合 (reports)

主要字段:

- goalId: 關聯目標 ID
- userId: 關聯用戶 ID
- type: 報告類型 (weekly/monthly)
- period: 報告週期
- content: 報告內容
- insights: AI 生成的洞察
- recommendations: 推薦建議

### 5. 臨時用戶集合 (tempUsers)

主要字段:

- tempId: 臨時用戶 ID
- expiresAt: 過期時間
- goals: 暫存目標數據
- convertedToUser: 是否已轉換為正式用戶

## 頁面要求

### 1. 主頁 (/)

- 展示網站宗旨和功能介紹
- 匿名用戶可瀏覽基本內容
- 登入用戶可看到個人目標摘要
- 最近目標進度的動態內容

### 2. 登入/註冊頁

- 支持 Google 帳號登入
- 僅在需要用戶身份時要求登入
- 訪客模式選項

### 3. 個人資料頁 (/profile)

- 顯示用戶信息
- 目標和進度概覽
- 個人信息編輯功能

### 4. 搜索/結果頁 (/search)

- 目標和進度搜索功能
- 結果摘要顯示
- 連結到詳細頁面

### 5. 詳細頁面 (/goals/:id)

- 目標詳細信息
- 進度歷史記錄
- AI 生成的分析和建議

## 項目進度計劃

### 迭代 1（第 1-10 天）

**目標：** 建立基礎架構，實現前後端連接和核心數據模型

- [x] 初始化 React 前端和 Express 後端專案
- [x] 設計並實現 MongoDB 數據模型（users, goals, progress, reports, temp_users）
- [] 開發基本主頁 (/)，包含匿名用戶可見內容
- [] 建立路由系統
- [] 實現基本 CRUD API 端點
- [] 設計目標創建和追蹤的基本 UI

**交付成果：**

- 可運行的前後端連接應用
- 完整的數據模型
- 基本 CRUD 功能的 API 端點
- 簡單但功能性的主頁

### 迭代 2（第 11-20 天）

**目標：** 擴展核心功能，整合外部 API，完善用戶體驗

- [] 完成所有 CRUD 操作的 API 和前端實現
- [] 整合 Google OAuth 實現用戶認證
- [] 實現目標創建和管理介面
- [] 開發進度追蹤和檢查點系統
- [] 添加搜索/篩選功能
- [] 實現詳細頁面顯示
- [] 初步整合 OpenAI API
- [] 優化導航和用戶體驗
- [] 添加錯誤處理和數據驗證

**交付成果：**

- 完整功能的 CRUD 操作
- 整合至少一個外部 API
- 改進的用戶界面和體驗
- 搜索和詳細頁面實現

### 迭代 3（第 21-30 天）

**目標：** 完善應用，添加高級功能，確保應用可用性和響應式設計

- [] 完成用戶認證和個人資料頁面
- [] 實現 AI 驅動的週報生成功能
- [] 添加用戶角色和權限系統
- [] 確保所有頁面響應式設計
- [] 進行可訪問性優化
- [] 進行全面測試和調整
- [] 準備最終部署
- [] 完善文檔和演示材料

**交付成果：**

- 完整功能的應用程序
- 響應式設計支持移動設備
- 高可訪問性評分
- 完整的用戶認證和個人化體驗

## 小組分工

### 成員 1

- 負責項目架構和後端開發
- 數據庫設計和 API 實現
- OpenAI API 整合

### 成員 2

- 負責前端開發和 UI 設計
- 實現響應式界面
- Google OAuth 整合

## 開發與部署說明

### 開發模式

```bash
# 開發模式運行後端
cd server
npm run dev

# 開發模式運行前端
cd client
npm run dev

# 或從根目錄同時運行兩者 (如果設置了根目錄 package.json)
npm run dev
```

### 生產構建

```bash
# 構建前端
cd client
npm run build

# 啟動後端服務器 (生產模式)
cd ../server
npm start
```

## 注意事項

1. 對於 MVP 階段 (約 100 用戶)，可以簡化專案結構，不需要像示例中那麼複雜的文件組織
2. 優先實現核心功能，先關注用戶、目標和進度管理
3. 使用 dotenv 分離配置，保持敏感信息安全
4. 確保 MongoDB 連接使用正確的連接字符串格式
5. 考慮使用 MongoDB Atlas 作為雲數據庫以避免本地配置問題

## 項目狀態

目前項目處於初始開發階段，準備按照 MVP 需求建立基礎架構。

```

```
`````
