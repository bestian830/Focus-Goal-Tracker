# Focus App 部署指南與經驗總結

本指南將幫助您設置和部署 Focus App 的前端和後端部分，並總結了部署過程中遇到的問題和解決方案。

## 部署經驗總結

在部署過程中，我們遇到了一些關鍵問題並成功解決：

### 後端部署挑戰

1. **CommonJS 轉換為 ES 模塊**：
   - 問題：後端最初使用 CommonJS (`require`/`module.exports`) 格式，但需要轉換為 ES 模塊 (`import`/`export`) 以適應 Vite 和現代 JavaScript。
   - 解決方案：系統地將所有 `require` 語句改為 `import`，將 `module.exports` 改為 `export default` 或具名 `export`。
   - 示例：
     ```javascript
     // 從
     const mongoose = require("mongoose");
     module.exports = mongoose.model("User", UserSchema);
     
     // 轉換為
     import mongoose from "mongoose";
     const User = mongoose.model("User", UserSchema);
     export default User;
     ```

2. **跨域 (CORS) 設置**：
   - 問題：前端和後端部署在不同的域上，導致 CORS 錯誤。
   - 解決方案：更新 CORS 配置以允許來自生產前端的請求，並確保 cookie 可以跨域傳輸。
   ```javascript
   app.use(
     cors({
       origin: function(origin, callback) {
         const allowedOrigins = [
           process.env.CLIENT_URL || "http://localhost:5173",
           "https://focusappdeploy-frontend.onrender.com"
         ];
         if(!origin || allowedOrigins.indexOf(origin) !== -1) {
           callback(null, true);
         } else {
           callback(new Error('Not allowed by CORS'));
         }
       },
       credentials: true,
       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
       allowedHeaders: ["Content-Type", "Authorization"],
     })
   );
   ```

3. **Cookie 設置**：
   - 問題：在清除 cookie 時沒有應用與設置時相同的參數，導致跨域 cookie 處理問題。
   - 解決方案：確保清除 cookie 時使用與設置時相同的選項：
   ```javascript
   const clearTokenCookie = (res) => {
     res.clearCookie('token', {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
       path: '/'
     });
   };
   ```

4. **環境變量**：
   - 問題：未正確設置 NODE_ENV 為 production，導致 cookie 安全設置不正確。
   - 解決方案：確保在生產環境中設置 `NODE_ENV=production`。

### 前端部署挑戰

1. **硬編碼的 API URL**：
   - 問題：前端代碼中直接硬編碼了後端 API 的本地地址 (`http://localhost:5050`)。
   - 解決方案：創建一個集中的 API 服務文件 (`api.js`)，使用環境變量設置基礎 URL。
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
   ```

2. **環境變量配置**：
   - 問題：缺少適當的環境變量設置，導致開發和生產環境之間的切換困難。
   - 解決方案：創建 `.env` 和 `.env.production` 文件，並在 Render 部署配置中設置相應的環境變量。

3. **Vite 配置**：
   - 問題：Vite 配置中的代理設置使用硬編碼的 URL。
   - 解決方案：更新 `vite.config.js` 以使用環境變量：
   ```javascript
   export default defineConfig(({ mode }) => {
     const env = loadEnv(mode, process.cwd())
     return {
       // ...
       server: {
         proxy: {
           "/api": {
             target: env.VITE_API_URL || "http://localhost:5050",
             changeOrigin: true,
           },
         },
       },
     }
   });
   ```

## 環境變量配置

### 前端環境變量

Focus App 前端使用環境變量來確定 API 服務器的 URL。您需要設置以下環境變量：

- `VITE_API_URL`: API 服務器的 URL

#### 開發環境

對於開發環境，我們已經創建了一個 `.env` 文件，其中包含默認設置：

```
VITE_API_URL=http://localhost:5050
```

#### 生產環境

對於生產環境，我們已經創建了一個 `.env.production` 文件，其中包含生產設置：

```
VITE_API_URL=https://focusappdeploy-backend.onrender.com
```

### 後端環境變量

後端需要設置以下環境變量：

```
PORT=5050
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
CLIENT_URL=https://focusappdeploy-frontend.onrender.com
JWT_SECRET=your_jwt_secret_key
```

## 手動部署步驟

### 前端部署

1. **安裝依賴**：
   ```bash
   cd client
   npm install
   ```

2. **構建應用**：
   ```bash
   npm run build
   ```
   這將生成一個包含靜態文件的 `dist` 目錄。

3. **部署靜態文件**：
   將 `dist` 目錄中的文件上傳到您的靜態文件服務器（如 Render、Netlify、Vercel 等）。

### 後端部署

1. **安裝依賴**：
   ```bash
   cd server
   npm install
   ```

2. **構建應用**（如果需要）：
   ```bash
   npm run build
   ```

3. **部署服務**：
   將後端代碼部署到支持 Node.js 的平台（如 Render、Heroku 等）。

## 在 Render 上部署

### 前端部署

1. 登錄到您的 Render 帳戶並創建一個新的 Static Site 服務。

2. **連接您的 GitHub 存儲庫，或上傳項目文件**。

3. 設置以下配置：
   - **名稱**: `focus-app-frontend`（或您喜歡的任何名稱）
   - **建置命令**: `cd client && npm install && npm run build`
   - **發布目錄**: `client/dist`
   - **環境變量**:
     - 添加環境變量 `VITE_API_URL` 並將其設置為您的後端服務 URL（如 `https://focusappdeploy-backend.onrender.com`）

4. 點擊 "Create Static Site" 按鈕。

### 後端部署

1. 登錄到您的 Render 帳戶並創建一個新的 Web Service。

2. 連接您的 GitHub 存儲庫，或上傳項目文件。

3. 設置以下配置：
   - **名稱**: `focusappdeploy-backend`（或您喜歡的任何名稱）
   - **建置命令**: `cd server && npm install`
   - **啟動命令**: `cd server && node server.js`
   - **環境變量**:
     - 添加所有必要的環境變量，包括 `NODE_ENV=production`、`CLIENT_URL` 等。

4. 點擊 "Create Web Service" 按鈕。

## 測試部署

部署完成後，通過以下步驟測試應用是否正常工作：

1. 訪問部署的前端 URL（例如，`https://focusappdeploy-frontend.onrender.com`）。
2. 嘗試登錄或以訪客身份繼續。
3. 驗證與後端 API 的通信是否正常工作。
4. 檢查控制台是否有任何錯誤或 CORS 問題。

## 故障排除

### CORS 問題

如果您遇到 CORS 錯誤：

1. 確保後端的 CORS 配置正確並包含前端域名。
2. 確保 cookie 設置允許跨域（`secure: true` 和 `sameSite: 'none'`）。
3. 檢查前端 API 調用是否包含 `withCredentials: true`。

### 認證問題

如果您遇到 401 未授權錯誤：

1. 檢查 cookie 設置是否正確。
2. 確保環境變量 `NODE_ENV` 設置為 `production`。
3. 檢查前端請求是否使用正確的 API URL。

### API 連接問題

如果前端無法連接到後端：

1. 確保環境變量 `VITE_API_URL` 正確設置。
2. 檢查網絡請求是否到達了後端服務器。
3. 驗證後端服務是否正常運行。

## 最佳實踐總結

1. **環境變量**：使用環境變量來管理不同環境之間的配置差異。
2. **API 服務封裝**：創建集中的 API 服務文件，而不是在組件中直接使用 axios。
3. **CORS 配置**：正確設置 CORS 以允許跨域請求和 cookie。
4. **Cookie 設置**：確保在跨域環境中使用 `secure: true` 和 `sameSite: 'none'`。
5. **ES 模塊**：現代 JavaScript 應用推薦使用 ES 模塊語法 (`import`/`export`)。 