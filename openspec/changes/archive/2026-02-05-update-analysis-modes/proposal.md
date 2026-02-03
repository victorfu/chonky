## Why

目前圖片分析功能包含 `code` 和 `error` 兩個較少使用的模式，而缺乏常見的圖片處理功能如去背景和人物切割。更新分析模式可以提供更實用的功能給使用者。

## What Changes

- **BREAKING**: 移除 `code` 分析模式（程式碼生成）
- **BREAKING**: 移除 `error` 分析模式（錯誤診斷）
- 新增 `remove-bg` 分析模式（去背景）
- 新增 `segment-person` 分析模式（人物切割）
- 更新相關 i18n 翻譯

## Capabilities

### New Capabilities

- `image-background-removal`: 圖片去背景功能，支援 API 服務（如 remove.bg）或瀏覽器端 ML 方案
- `image-person-segmentation`: 人物切割功能，使用 MediaPipe 或類似技術進行人物分割

### Modified Capabilities

（無需修改現有 spec）

## Impact

- **程式碼**:
  - `src/types/screenshot.ts` - 更新 AnalysisMode 類型定義
  - `src/i18n/locales/*.json` - 更新所有語言的翻譯
  - 分析頁面 UI 組件
  - 分析服務 - 整合新的圖片處理 API/函式庫
- **API/依賴**:
  - 可能需要 remove.bg API 或類似服務的 API key
  - 可能需要 MediaPipe/TensorFlow.js 依賴
- **破壞性變更**:
  - 使用 `code` 或 `error` 模式的現有分析紀錄將無法重新執行
