# Postman Collection Guide for Focus App API

## User Models in Focus App

本应用有两种用户存储系统：

1. **User 模型** (users 集合)

   - 只包含正式註冊用戶
   - 正式註冊用戶：有 email/password 或 googleID，
   - 存儲在 users 集合
   - 可以創建最多4個目標(預設3個)：bonus 1
   - 正式用戶可以長期使用所有功能
   - 帳號密碼如果用google API 認證就是需要一個轉換儲存的問題（這部分可能要用到google的api)

2. **TempUser 模型** (temp_users 集合)
   - 完全獨立的臨時數據存儲
   - 使用 tempId 標識
   - 只能創建一個目標
   - 21 天後自動過期
   - 用於前期體驗，可以轉換為正式用戶

## API 端點詳細說明

### 1. User Management

#### Register User (註冊用戶)

- **端點**: `POST /api/auth/register`
- **目的**: 創建一個新的正式用戶賬戶
- **參數**:
  - username: 用戶名
  - email: 電子郵件（唯一）
  - password: 密碼（將被加密存儲）
  - tempId: (可選) 如要關聯 TempUser 數據
- **使用場景**: 創建新賬戶或從 TempUser 轉換為正式賬戶

#### Login User (用戶登錄)

- **端點**: `POST /api/auth/login`
- **目的**: 用戶登錄並獲取 JWT 認證令牌
- **參數**:
  - email: 電子郵件
  - password: 密碼
- **使用場景**: 已註冊用戶登錄系統

#### Get User Info (獲取用戶信息)

- **端點**: `GET /api/auth/me/:userId`
- **目的**: 獲取指定用戶的詳細信息
- **參數**:
  - userId: 用戶 ID（URL 參數）
- **使用場景**: 獲取已登錄或訪客用戶的信息

#### Link Temp User (關聯臨時用戶)

- **端點**: `POST /api/auth/link-temp`
- **目的**: 將臨時用戶(TempUser)數據關聯到正式用戶賬戶
- **參數**:
  - tempId: 臨時用戶 ID
  - userId: 正式用戶 ID
- **使用場景**: 當臨時用戶註冊正式賬戶時，保留其之前的數據

### 2. Guest User Management

#### Create Guest User (創建訪客用戶)

- **端點**: `POST /api/auth/guest`
- **目的**: 創建一個新的訪客用戶（存儲在 users 集合中）
- **參數**: 無需參數，系統自動生成
- **使用場景**: 用戶希望無需註冊即可使用基本功能

#### Get Guest User Info (獲取訪客用戶信息)

- **端點**: `GET /api/auth/me/:userId`
- **目的**: 獲取訪客用戶的詳細信息
- **參數**:
  - userId: 訪客用戶 ID（URL 參數）
- **使用場景**: 獲取已創建的訪客用戶信息

### 3. TempUser API (Future Implementation)

#### Create Temp User (創建臨時用戶)

- **端點**: `POST /api/temp-users`
- **目的**: 創建一個新的臨時用戶記錄（存儲在 temp_users 集合）
- **參數**:
  - tempId: 臨時用戶唯一標識（可選，如不提供則自動生成）
- **使用場景**: 為首次使用應用的用戶提供最小功能體驗

#### Get Temp User (獲取臨時用戶)

- **端點**: `GET /api/temp-users/:tempId`
- **目的**: 獲取指定臨時用戶的信息
- **參數**:
  - tempId: 臨時用戶 ID（URL 參數）
- **使用場景**: 查詢臨時用戶的基本信息和目標

#### Add Goal to Temp User (為臨時用戶添加目標)

- **端點**: `POST /api/temp-users/:tempId/goals`
- **目的**: 為臨時用戶創建一個目標（限一個）
- **參數**:
  - tempId: 臨時用戶 ID（URL 參數）
  - title: 目標標題
  - description: 目標描述
- **使用場景**: 臨時用戶希望設置一個簡單目標進行追蹤

### 4. Goal Management

#### Create Goal (創建目標)

- **端點**: `POST /api/goals`
- **目的**: 為用戶創建一個新目標
- **參數**:
  - userId: 用戶 ID
  - title: 目標標題
  - description: 目標描述
  - priority: 優先級（可選）
  - deadline: 截止日期（可選）
- **使用場景**: 用戶希望創建一個新的目標進行追蹤

#### Get User Goals (獲取用戶目標)

- **端點**: `GET /api/goals/:userId`
- **目的**: 獲取指定用戶的所有目標
- **參數**:
  - userId: 用戶 ID（URL 參數）
- **使用場景**: 查看用戶創建的所有目標列表

#### Get Goal Details (獲取目標詳情)

- **端點**: `GET /api/goals/detail/:id`
- **目的**: 獲取特定目標的詳細信息
- **參數**:
  - id: 目標 ID（URL 參數）
- **使用場景**: 查看單個目標的完整信息

#### Update Goal (更新目標)

- **端點**: `PUT /api/goals/:id`
- **目的**: 更新現有目標的基本信息
- **參數**:
  - id: 目標 ID（URL 參數）
  - title: 新目標標題（可選）
  - description: 新目標描述（可選）
  - priority: 新優先級（可選）
- **使用場景**: 修改目標的基本信息

#### Update Goal Status (更新目標狀態)

- **端點**: `PUT /api/goals/:id/status`
- **目的**: 更新目標的狀態（如進行中、已完成）
- **參數**:
  - id: 目標 ID（URL 參數）
  - status: 新狀態值
- **使用場景**: 標記目標的完成狀態

#### Add Goal Checkpoint (添加目標檢查點)

- **端點**: `POST /api/goals/:id/checkpoints`
- **目的**: 為目標添加一個里程碑或檢查點
- **參數**:
  - id: 目標 ID（URL 參數）
  - title: 檢查點標題
  - description: 檢查點描述（可選）
  - targetDate: 目標完成日期（可選）
- **使用場景**: 將目標分解為可管理的小步驟

#### Update Goal Declaration (更新目標宣言)

- **端點**: `PUT /api/goals/:id/declaration`
- **目的**: 更新目標的宣言或願景聲明
- **參數**:
  - id: 目標 ID（URL 參數）
  - content: 宣言內容
  - vision: 願景描述（可選）
- **使用場景**: 幫助用戶明確目標的意義和動機

#### Delete Goal (刪除目標)

- **端點**: `DELETE /api/goals/:id`
- **目的**: 永久刪除一個目標
- **參數**:
  - id: 目標 ID（URL 參數）
- **使用場景**: 用戶需要移除不再需要的目標

### 5. Progress Tracking

#### Create Progress Record (創建進度記錄)

- **端點**: `POST /api/progress`
- **目的**: 創建一條新的目標進度記錄
- **參數**:
  - goalId: 目標 ID
  - userId: 用戶 ID
  - records: 進度記錄數組（包含 content, duration, mood 等）
- **使用場景**: 記錄用戶在目標上的進展

#### Get Goal Progress (獲取目標進度)

- **端點**: `GET /api/progress?goalId=X`
- **目的**: 獲取特定目標的所有進度記錄
- **參數**:
  - goalId: 目標 ID（查詢參數）
- **使用場景**: 查看目標的所有歷史進度記錄

#### Update Progress Record (更新進度記錄)

- **端點**: `PUT /api/progress/:id`
- **目的**: 更新現有的進度記錄
- **參數**:
  - id: 進度記錄 ID（URL 參數）
  - records: 更新的記錄數組（可選）
  - summary: 進度總結（可選）
- **使用場景**: 修改之前創建的進度記錄

#### Add Record Item (添加記錄項)

- **端點**: `POST /api/progress/:id/records`
- **目的**: 向現有進度記錄添加新項目
- **參數**:
  - id: 進度記錄 ID（URL 參數）
  - content: 記錄內容
  - duration: 持續時間（分鐘）
  - mood: 情緒狀態（可選）
- **使用場景**: 在不創建新進度記錄的情況下添加記錄

#### Update Checkpoint Status (更新檢查點狀態)

- **端點**: `PUT /api/progress/:id/checkpoints/:checkpointId`
- **目的**: 更新檢查點的完成狀態
- **參數**:
  - id: 進度記錄 ID（URL 參數）
  - checkpointId: 檢查點 ID（URL 參數）
  - isCompleted: 完成狀態（布爾值）
- **使用場景**: 標記目標檢查點的完成情況

#### Get Progress Summary (獲取進度摘要)

- **端點**: `GET /api/progress/summary`
- **目的**: 獲取特定時間段內的目標進度摘要
- **參數**:
  - goalId: 目標 ID（查詢參數）
  - startDate: 開始日期（查詢參數）
  - endDate: 結束日期（查詢參數）
- **使用場景**: 查看目標進度的統計和趨勢分析

### 6. Report Management

#### Generate Report (生成報告)

- **端點**: `POST /api/reports/generate`
- **目的**: 根據進度記錄生成目標報告
- **參數**:
  - goalId: 目標 ID
  - userId: 用戶 ID
  - type: 報告類型（如 weekly, monthly）
  - period: 報告時間段（包含 startDate 和 endDate）
- **使用場景**: 創建目標進度的總結報告

#### Get Reports for Goal (獲取目標報告)

- **端點**: `GET /api/reports?goalId=X`
- **目的**: 獲取特定目標的所有報告
- **參數**:
  - goalId: 目標 ID（查詢參數）
- **使用場景**: 查看目標的歷史報告

#### Get Report Details (獲取報告詳情)

- **端點**: `GET /api/reports/:id`
- **目的**: 獲取特定報告的詳細內容
- **參數**:
  - id: 報告 ID（URL 參數）
- **使用場景**: 查看單個報告的完整信息

#### Update Report Content (更新報告內容)

- **端點**: `PUT /api/reports/:id`
- **目的**: 更新現有報告的內容
- **參數**:
  - id: 報告 ID（URL 參數）
  - content: 報告內容
  - insights: 洞察數組（可選）
  - recommendations: 建議數組（可選）
- **使用場景**: 修改或豐富自動生成的報告

#### Delete Report (刪除報告)

- **端點**: `DELETE /api/reports/:id`
- **目的**: 永久刪除一個報告
- **參數**:
  - id: 報告 ID（URL 參數）
- **使用場景**: 移除不再需要的報告

#### Export Report as PDF (導出報告為 PDF)

- **端點**: `GET /api/export/reports/:id/pdf`
- **目的**: 將報告導出為 PDF 格式
- **參數**:
  - id: 報告 ID（URL 參數）
- **使用場景**: 以可打印格式保存或分享報告

## User 與 TempUser 的區別與轉換

### 關鍵區別

- **User (所有透過帳號密碼註冊/或者googelAPI認證的用戶）**:

  - 存儲在 users 集合
  - 可以創建最多4個目標(預設3個)：bonus 1
  - 正式用戶可以長期使用所有功能
  - 帳號密碼如果用google API 認證就是需要一個轉換儲存的問題（這部分可能要用到google的api)

- **TempUser**:
  - 存儲在 temp_users 集合
  - 只能創建一個目標
  - 21 天後自動刪除
  - 沒有

### 數據轉換流程

1. TempUser 用戶決定註冊時，先創建正式 User
2. 使用 link-temp API 關聯 TempUser 和新創建的 User
3. 系統遷移 TempUser 的目標數據到 User
4. TempUser 數據最終被系統自動刪除

#### 數據轉換示例代碼

```javascript
// 1. 從 tempuser 找到該文件
const tempUser = await TempUser.findById(tempUserId);
if (!tempUser) {
  throw new Error("未找到臨時用戶");
}

// 2. 建立新的 user 文件，並把 _id 直接複製
const newUser = new User({
  _id: tempUser._id, // 保留原 _id
  username: tempUser.username,
  email: tempUser.email,
  goal: tempUser.goal,
  // ... 其他需要遷移的欄位
});
await newUser.save();

// 3. 遷移完畢後，可選擇刪除 tempuser 中的文件
await TempUser.findByIdAndRemove(tempUserId);
```

## 使用說明

1. 對於一般用例，首先測試正式用戶註冊和訪客用戶功能
2. 使用 Guest User 功能（users 集合中的訪客）進行大部分測試
3. 只在需要測試極簡體驗流程時使用 TempUser API
4. 按照集合中的順序測試，先創建用戶，再創建目標
5. 使用變量存儲返回的 ID，以便後續請求使用
