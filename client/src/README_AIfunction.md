# README: Goal Tracker 功能升级 (2024年4月)

## 概述

本次更新对 Goal Tracker 应用进行了多项重要功能增强和问题修复，旨在改善用户体验、提升数据准确性并引入智能化分析。主要更新包括：彻底修复了 Daily Task 勾选状态的保存问题，集成了基于 Hugging Face 的 AI 进度分析功能，添加了 PDF 导出能力，并调整了页面布局。

## 主要变更与功能

### 1. Daily Task 状态保存重构

*   **问题**: 用户之前遇到的 Daily Task 勾选状态无法正确持久化的问题（特别是点击 "Save Changes" 后状态丢失）已得到彻底解决。
*   **修复**:
    *   **简化 API 调用**: 移除了冗余的 API 保存调用，统一由 `DailyCardRecord` 组件负责状态的即时保存 (`handleTaskStatusChange`) 和最终保存 (`handleSave`)。
    *   **修正回调数据**: 确保了 `onSave` 回调在不同保存场景下（单独勾选 vs. 点击 Save Changes）传递的数据格式一致（传递单个更新后的卡片对象）。
    *   **强制深拷贝**: 在组件间传递状态 (`cardData`, `dailyCards`) 和更新内部状态 (`taskCompletions`) 时，广泛使用了 `JSON.parse(JSON.stringify(...))` 进行深拷贝，彻底解决了因对象引用导致的状态覆盖和更新不一致问题。
    *   **初始化修复**: 确保了在 `WeeklyDailyCards` 中为新日期创建卡片数据时，正确初始化了 `taskCompletions: {}` 字段。
    *   **日期验证完善**: 修正了 `validateCardData` 函数，确保在处理无效或缺失日期时能保留原始卡片的 `taskCompletions` 等关键状态。
*   **涉及文件**: `client/src/components/GoalDetails/*`, `server/controllers/goalsController.js`

### 2. AI 进度分析集成

*   **新增功能**: 在 Progress Report 区域添加了 "AI 进度分析" 功能。用户可以点击 "生成分析" 按钮，获取由 AI 模型基于近期目标进展（从 Daily Cards 读取）生成的分析和建议。
*   **实现**:
    *   **后端**:
        *   创建了新的 API 路由 (`server/routes/reports.js`) 处理 `POST /api/reports/:goalId` 请求。
        *   创建了新的控制器 (`server/controllers/reportsController.js`) 包含核心逻辑：
            *   `generateReport`: 获取 `goalId`，从数据库查询 Goal 数据。
            *   `buildPrompt`: 根据 Goal 描述、Daily Tasks 和最近的 Daily Cards (任务完成情况、进度记录) 构建结构化的 Prompt。
            *   `callAIService`: 使用 `axios` 调用外部 Hugging Face Inference API，发送 Prompt 并获取 AI 生成的文本。
        *   需要配置环境变量（见下文）来指定 Hugging Face API Token 和模型 URL。
        *   需要安装 `axios` 和 `dotenv` 依赖 (`npm install axios dotenv -C server`)。
    *   **前端**:
        *   创建了 `AIFeedback.jsx` 组件 (`client/src/components/ProgressReport/`)，包含 "生成分析" 按钮、加载状态、错误显示以及展示 AI 返回的 `feedback.content`。
        *   `api.js` 中添加了调用后端报告生成 API 的服务。
*   **Prompt 优化**: 对发送给 AI 的 Prompt 进行了迭代，明确要求输出包含 "Progress Analysis", "Potential Challenges", "Actionable Suggestions" 三个部分，并指示 AI 不要生成 "Key Achievements" 等无关内容。

### 3. PDF 导出功能

*   **新增功能**: 在 Progress Report 区域添加了 "Export PDF" 按钮。
*   **实现**:
    *   使用客户端库 `html2canvas` 和 `jspdf` 实现。
    *   `ExportButton.jsx` (`client/src/components/ProgressReport/`) 包含 `handleExport` 逻辑：
        *   使用 `html2canvas` 捕获 `.main-content` 区域的 DOM 元素，生成 Canvas 图像。
        *   使用 `jspdf` 将 Canvas 图像添加到 PDF 文档中。
        *   自动处理内容分页。
        *   触发浏览器下载名为 `GoalProgressReport.pdf` 的文件。
    *   需要安装依赖 (`npm install html2canvas jspdf -C client`)。

### 4. 页面布局调整 (Flexbox)

*   **修改**: 调整了 `Home.jsx` 页面的主要内容区域 (`.main-content`) 的 CSS 样式 (`client/src/styles/Home.css`)。
*   **效果**: 使用 Flexbox 实现了 Sidebar、GoalDetails 和 ProgressReport 三个区域固定的 `1:2:1` 宽度比例布局，并确保各区域在内容溢出时可以独立滚动。

### 5. 组件移除

*   **移除**: 删除了不再需要的 `KeyAchievements.jsx` 组件及其在 `ProgressReport.jsx` 中的引用。

## Hugging Face AI 配置指南

要使 AI 进度分析功能正常工作，您需要配置 Hugging Face Inference API。

**为什么使用 Hugging Face?**
Hugging Face 提供了大量的预训练 AI 模型，并且其 Inference API 允许我们免费（在一定限额内）调用这些模型，而无需自己部署和管理。

**配置步骤:**

1.  **选择一个模型**:
    *   访问 [Hugging Face Models](https://huggingface.co/models)。
    *   选择一个适合文本生成或指令遵循的模型。**强烈推荐**使用 Instruction-Tuned (指令调优) 的模型，它们更擅长理解和执行我们的 Prompt。
    *   **推荐模型**: `mistralai/Mistral-7B-Instruct-v0.2` (性能好，响应较快)。
    *   **备选模型**: `meta-llama/Llama-2-7b-chat-hf` (性能强，但可能稍慢)。您也可以尝试其他模型，但需要注意它们是否与我们代码中的请求/响应格式兼容。

2.  **找到模型的 Inference API URL**:
    *   在 Hugging Face 网站上搜索您选择的模型名称。
    *   进入该模型的页面。
    *   点击页面上的 "Deploy" 或 "Use" 按钮/下拉菜单。
    *   选择 "Inference API" 选项。
    *   您会看到该模型的 API URL。**复制这个完整的 URL**。
        *   *例如，对于 `mistralai/Mistral-7B-Instruct-v0.2`，URL 是 `https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2`*

3.  **创建 Hugging Face Access Token**:
    *   登录 Hugging Face 网站。
    *   点击您的头像（右上角），选择 "Settings"。
    *   在左侧菜单中选择 "Access Tokens"。
    *   点击 "New token" 按钮。
    *   **Token name**: 输入一个描述性名称，例如 `GoalTrackerApp`。
    *   **Role**: 选择 **`Read`**。Read 权限足以调用 Inference API。
    *   点击 "Generate a token"。
    *   **重要**: Hugging Face 会**显示一次**新生成的 Token 值 (以 `hf_` 开头)。**请立即复制这个完整的 Token** 并安全保存。离开此页面后您将无法再次看到完整 Token。

4.  **配置 `.env` 文件 (后端)**:
    *   在您的项目**后端**目录 (`server/`) 下，找到或创建一个名为 `.env` 的文件。
    *   打开 `.env` 文件，添加或修改以下两行，将您复制的 Token 和 URL 粘贴进去：
        ```env
        # server/.env
        HUGGINGFACE_API_TOKEN=hf_YOUR_COPIED_TOKEN_HERE
        HUGGINGFACE_API_URL=YOUR_COPIED_MODEL_API_URL_HERE
        ```
        *示例:*
        ```env
        HUGGINGFACE_API_TOKEN=hf_abc123xyz...
        HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2
        ```
    *   **安全提示**: `.env` 文件包含敏感信息，**切勿**将其提交到 Git 等版本控制系统。请确保您的 `.gitignore` 文件 (通常在项目根目录或 `server` 目录) 中包含 `.env` 这一行。

5.  **安装后端依赖 (如果尚未安装)**:
    *   确保您的后端安装了 `axios` (用于 API 调用) 和 `dotenv` (用于加载 `.env` 文件)。在 `server` 目录下运行：
        ```bash
        npm install axios dotenv
        ```

6.  **重启后端服务器**:
    *   **非常重要**: 修改 `.env` 文件后，您必须**完全停止** (在终端按 `Ctrl+C`) 并**重新启动**您的后端开发服务器 (`npm run dev`)，这样新的环境变量才能被 Node.js 进程加载。

完成以上步骤后，您的 AI 进度分析功能应该就可以正常连接到 Hugging Face 并尝试生成反馈了。

## PDF 导出依赖

确保您的**前端**项目 (`client/`) 安装了必要的库：

```bash
npm install html2canvas jspdf
```

## 故障排除

*   **AI 功能报错 `503 Service Unavailable`**: 通常意味着 Hugging Face 的模型正在加载（特别是第一次调用或长时间未使用后）。请稍等几分钟再试。如果持续出现，请检查 Hugging Face 模型页面是否有状态更新，或尝试更换模型 URL。
*   **AI 功能报错 `401 Unauthorized` / "Authentication Failed"**: 请仔细核对 `server/.env` 文件中的 `HUGGINGFACE_API_TOKEN` 是否与您从 Hugging Face 复制的完全一致，然后重启服务器。
*   **AI 功能报错 `404 Not Found`**: 请仔细核对 `server/.env` 文件中的 `HUGGINGFACE_API_URL` 是否是您选择模型的正确 **Inference API URL**，然后重启服务器。
*   **AI 输出质量不佳/格式混乱**:
    *   尝试调整 `server/controllers/reportsController.js` 中 `buildPrompt` 函数的指令。Prompt Engineering 是一个迭代过程。
    *   尝试更换一个能力更强或更适合指令遵循的 AI 模型（别忘了更新 `.env` 文件并重启）。
    *   检查 `callAIService` 函数中解析 API 响应的逻辑是否与所选模型返回的数据结构匹配（查看服务器日志中的 "AI service raw response data"）。
*   **PDF 导出失败/空白/样式丢失**:
    *   检查浏览器控制台是否有 `html2canvas` 或 `jsPDF` 相关的错误。
    *   确保 `ExportButton.jsx` 中 `document.querySelector('.main-content')` 能够正确选中您想要导出的 HTML 容器。
    *   复杂 CSS（如某些 Flexbox/Grid 布局、伪元素、外部字体）可能无法被 `html2canvas` 完美捕获。
