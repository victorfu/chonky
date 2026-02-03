## 1. 類型與配置更新

- [x] 1.1 更新 `src/types/screenshot.ts` 中的 `AnalysisMode` 類型，移除 `code` 和 `error`，新增 `remove-bg` 和 `segment-person`
- [x] 1.2 更新 `ANALYSIS_MODES` 陣列
- [x] 1.3 更新 `ANALYSIS_MODE_CONFIGS` 配置物件
- [x] 1.4 新增 `ScreenshotAnalysis.resultType` 欄位區分文字/圖片結果

## 2. i18n 翻譯更新

- [x] 2.1 更新 `src/i18n/locales/zh-TW.json` 移除舊模式翻譯，新增新模式翻譯
- [x] 2.2 更新 `src/i18n/locales/en-US.json`（如存在）
- [x] 2.3 更新 `src/i18n/locales/ja-JP.json`（如存在）
- [x] 2.4 新增去背/人物切割模式的 prompt 翻譯

## 3. 分析服務擴展

- [x] 3.1 在 `src/services/screenshotAnalysis.ts` 中新增圖片處理相關類型定義
- [x] 3.2 實作 `parseGeminiCoordinates` 函式解析 Gemini 輸出的座標 JSON
- [x] 3.3 實作 `processImageWithMask` 函式使用 Canvas API 處理圖片
- [x] 3.4 更新 `analyzeScreenshot` 函式支援新模式的不同輸出格式

## 4. UI 組件更新

- [x] 4.1 更新 `src/components/screenshots/AnalysisModeSelector.tsx` 圖示對應（新增 ImageMinus, UserRound 圖示）
- [x] 4.2 更新 `src/components/screenshots/AnalysisResult.tsx` 支援顯示處理後圖片
- [x] 4.3 新增圖片下載按鈕功能

## 5. Store 與狀態管理

- [x] 5.1 更新 `src/stores/useScreenshotStore.ts` 支援新的結果類型
- [x] 5.2 確保舊的 code/error 分析紀錄不會造成錯誤

## 6. 測試與驗證

- [ ] 6.1 手動測試去背功能（需使用者驗證）
- [ ] 6.2 手動測試人物切割功能（需使用者驗證）
- [ ] 6.3 驗證舊模式（explain, ocr, translate）仍正常運作（需使用者驗證）
- [ ] 6.4 驗證 i18n 在所有語言下正確顯示（需使用者驗證）
