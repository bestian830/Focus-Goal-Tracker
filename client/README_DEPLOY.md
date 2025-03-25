# Focus App 前端部署指南

本指南將幫助您設置和部署 Focus App 的前端部分。

## 環境變量配置

Focus App 前端使用環境變量來確定 API 服務器的 URL。您需要設置以下環境變量：

- `VITE_API_URL`: API 服務器的 URL

### 開發環境

對於開發環境，我們已經創建了一個 `.env` 文件，其中包含默認設置：

```
VITE_API_URL=http://localhost:5050
```

### 生產環境

對於生產環境，我們已經創建了一個 `.env.production` 文件，其中包含生產設置：

```
VITE_API_URL=https://focusappdeploy-backend.onrender.com
```

如果您要部署到其他生產環境，您可以修改此文件或在部署過程中設置環境變量。

## 手動部署步驟

按照以下步驟手動部署 Focus App 前端：

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

## 在 Render 上部署

要在 Render 上部署 Focus App 前端：

1. 登錄到您的 Render 帳戶並創建一個新的 Static Site 服務。

2. 連接您的 GitHub 存儲庫，或上傳項目文件。

3. 設置以下配置：
   - **名稱**: `focus-app-frontend`（或您喜歡的任何名稱）
   - **建置命令**: `cd client && npm install && npm run build`
   - **發布目錄**: `client/dist`
   - **環境變量**:
     - 添加環境變量 `VITE_API_URL` 並將其設置為您的後端服務 URL（如 `https://focusappdeploy-backend.onrender.com`）

4. 點擊 "Create Static Site" 按鈕。

## 測試部署

部署完成後，通過以下步驟測試應用是否正常工作：

1. 訪問部署的 URL（例如，`https://focus-app-frontend.onrender.com`）。
2. 嘗試登錄或以訪客身份繼續。
3. 驗證與後端 API 的通信是否正常工作。

## 故障排除

如果您遇到問題：

1. 檢查控制台錯誤以查看是否有 API 連接問題。
2. 驗證環境變量是否正確設置。
3. 確保後端服務正在運行並可訪問。
4. 檢查 CORS 配置以確保前端可以與後端通信。

## 更新部署

要更新已部署的應用程序：

1. 更新代碼並提交到版本控制系統。
2. 如果使用 Render 連續部署，更改將自動部署。
3. 如果手動部署，請再次執行構建步驟並上傳新文件。 