# STAR 報告生成器

STAR 報告生成器是一個專為員工設計的工具，利用 AI 技術自動優化 STAR（情境、任務、行動、結果）格式的工作報告，讓員工能以專業、自然且結構化的方式呈現工作成果。這個工具可以幫助將撰寫報告的時間從 2 小時縮短到 5 分鐘。

![STAR報告生成器](screenshots/star-generator.gif)

## 目錄
- [功能特點](#功能特點)
- [技術架構](#技術架構)
- [環境需求](#環境需求)
- [安裝與部署](#安裝與部署)
- [使用指南](#使用指南)
- [Token 使用量](#token-使用量)
- [注意事項](#注意事項)
- [隱私政策](#隱私政策)
- [開發者功能](#開發者功能)
- [貢獻指南](#貢獻指南)
- [授權許可](#授權許可)

## 功能特點

- **AI 輔助優化**：自動優化用戶輸入的 STAR 報告內容，提升專業性和可讀性
- **支持多種商店類別**：針對不同部門（保養、彩妝、香氛等）客製化內容
- **即時字數統計**：自動計算並顯示輸入和輸出的字數
- **一鍵複製功能**：方便快速複製已生成的報告內容
- **響應式設計**：適配桌面和移動設備
- **防止資料丟失**：在可能導致資料丟失的操作前提供確認提示

## 技術架構

- **前端**：HTML5、CSS3、原生 JavaScript（無框架）
- **後端**：使用 Cloudflare Workers 作為 API 中介層
- **AI 模型**：使用 OpenAI GPT-4.1 模型處理自然語言生成任務
- **數據存儲**：使用 Google Sheets 記錄使用數據（可選功能）

## 環境需求

- 任何現代網頁瀏覽器（Chrome、Firefox、Safari、Edge 等）
- 用於開發：
  - Node.js >= 14.0.0（如使用本地開發伺服器）
  - Cloudflare 帳戶（用於部署 Worker）
  - OpenAI API 密鑰
  - Google 帳戶（用於 Google Sheets 整合，可選）

## 本地開發設置

1. 複製 `.env.example` 為 `.env` 文件
2. 在 `.env` 文件中填入您的 API 密鑰和 URL
3. 使用本地服務器運行應用（如 http-server）

## 安裝與部署

### 前端部署

1. 克隆本倉庫到你的本地環境或 Web 服務器

```bash
git clone https://github.com/ouhsiu1993/star-generator.git
cd star-generator
```

2. 將文件上傳到你的 Web 服務器或使用本地服務器運行

```bash
# 如果你有Node.js，可以使用http-server等工具在本地運行
npx http-server
```

### Cloudflare Worker 部署

1. 創建一個 Cloudflare 帳戶（如果沒有的話）
2. 在 Cloudflare Dashboard 中創建一個新的 Worker
3. 複製`worker.ts`的內容到你的 Worker 中
4. 替換 API 密鑰為你自己的 OpenAI API 密鑰
5. 部署 Worker 並記下 URL，更新`script.js`中的 API 請求 URL

### Google Sheets 整合（可選）

1. 創建一個新的 Google Sheets 文檔
2. 打開擴充功能 > Apps Script
3. 複製`appscript`內容到 Apps Script 編輯器中
4. 保存並部署為 Web 應用程序（要設置為"以編輯者的身份執行"並允許"所有人"訪問）
5. 獲取 Web 應用程序 URL，並更新`script.js`中的`GOOGLE_SHEET_WEBHOOK_URL`變量

### 使用 Docker 部署（可選）

若您希望使用 Docker 容器部署前端，可以使用以下步驟：

1. 確保您已安裝 Docker
2. 在專案根目錄創建 Dockerfile
3. 運行以下命令構建並啟動容器：

```bash
docker build -t star-generator .
docker run -p 8080:80 star-generator
```

## 使用指南

1. **選擇商店類別**：從下拉選單中選擇你所屬的商店類別
2. **填寫 STAR 報告**：在每個部分（情境、任務、行動、結果）填寫對應的內容
3. **生成報告**：點擊"生成 STAR 報告"按鈕，系統將使用 AI 優化你的報告
4. **查看結果**：優化後的報告將顯示在每個部分的輸出區域
5. **複製內容**：點擊每個部分旁的"複製"按鈕，可以單獨複製對應部分的內容
6. **清除所有**：點擊"清除所有"按鈕可以重置所有輸入和輸出

## Token 使用量

系統會顯示當前的 Token 使用量，總限制為 1,000,000 tokens。Token 使用量包括：

- 輸入 Token 數：發送到 AI 模型的文本量
- 輸出 Token 數：AI 模型生成的文本量
- 總計 Token 數：當前使用的總 Token 數

## 注意事項

- 每個部分的描述建議控制在 300 字以內
- AI 優化後的內容會控制在 100-150 字之間，適合提交給主管的報告格式
- 所有輸入的內容僅用於生成報告，不會用於其他用途

## 隱私政策

本工具重視用戶隱私，使用以下原則：

- 輸入的內容僅用於生成報告，不會永久存儲
- 如果啟用 Google Sheets 記錄功能，數據將存儲在您控制的試算表中
- 不收集任何個人身份信息
- 所有 API 通信使用 HTTPS 加密
- 建議定期檢查和清理 Google Sheets 存儲的歷史數據

## 開發者功能

- **程式碼結構**：

  - `index.html`：頁面結構
  - `styles.css`：樣式定義
  - `script.js`：交互邏輯和 API 請求
  - `worker.ts`：Cloudflare Worker 代碼
  - `appscript`：Google Sheets 整合代碼

- **數據流程**：
  1. 用戶輸入內容
  2. 前端發送請求到 Cloudflare Worker
  3. Worker 轉發請求到 OpenAI API
  4. 返回 AI 生成的內容
  5. 解析並顯示在界面上
  6. 可選：記錄使用數據到 Google Sheets

## API 文檔

系統使用以下 API 端點：

### 1. Cloudflare Worker API

**URL**: `https://your-worker-url.workers.dev`

**方法**: POST

**請求體**:
```json
{
  "model": "gpt-4.1",
  "messages": [
    {
      "role": "system",
      "content": "系統指令..."
    },
    {
      "role": "user",
      "content": "用戶輸入..."
    }
  ]
}
```

**回應**:
```json
{
  "choices": [
    {
      "message": {
        "content": "AI生成的回應..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

### 2. Google Sheets Webhook API（可選）

**URL**: `https://script.google.com/macros/s/your-script-id/exec`

**方法**: POST

**請求體**:
```json
{
  "timestamp": "2023-05-01T12:00:00.000Z",
  "processingTime": 2.5,
  "storeCategory": "香水香氛",
  "inputData": {
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "..."
  },
  "outputData": {
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "..."
  }
}
```

## 貢獻指南

我們歡迎所有形式的貢獻，包括錯誤報告、功能請求和代碼貢獻。

### 提交問題

1. 使用 GitHub Issues 提交錯誤報告或功能請求
2. 清楚描述問題或建議，並提供相關的上下文信息
3. 如果可能，提供重現步驟或示例

### 提交代碼

1. Fork 這個倉庫
2. 創建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 代碼風格

- 保持代碼簡潔、可讀
- 遵循現有的編碼風格和模式
- 添加適當的註釋和文檔

## 授權許可

MIT License - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 聯絡方式

如有任何問題或建議，請通過以下方式聯繫：

- GitHub Issues: [https://github.com/ouhsiu1993/star-generator/issues](https://github.com/ouhsiu1993/star-generator/issues)
- Email: ouhsiu1993@gmail.com

---

**STAR 報告生成器** - 讓報告撰寫更高效、更專業！