## Context

目前圖片分析使用 Firebase AI (Gemini Vision) 進行各種模式的分析。現有架構：
- `screenshotAnalysis.ts` - 使用 Gemini 串流生成分析結果
- `AnalysisModeSelector.tsx` - UI 選擇器組件
- `screenshot.ts` - 類型定義和模式配置

Gemini Vision 無法直接輸出去背圖片，但可以輸出物體邊界座標。我們可以：
1. 讓 Gemini 識別圖片中的主體/人物並輸出座標
2. 使用 Canvas API 根據座標進行圖片處理

## Goals / Non-Goals

**Goals:**
- 移除 `code` 和 `error` 分析模式
- 新增 `remove-bg` 模式（去背景）
- 新增 `segment-person` 模式（人物切割）
- 使用現有 Gemini Vision 基礎設施
- 輸出處理後的圖片供下載

**Non-Goals:**
- 不使用外部付費 API（如 remove.bg）
- 不實現即時影片處理
- 不追求專業級去背品質（Gemini 座標識別有限制）

## Decisions

### 1. 使用 Gemini 進行物體識別 + Canvas 處理

**決策**: 讓 Gemini 輸出 JSON 格式的邊界框/多邊形座標，然後用 Canvas API 處理圖片。

**替代方案考慮**:
- remove.bg API: 品質最好但需要付費和 API key 管理
- MediaPipe 瀏覽器端: 免費但需要額外依賴，模型載入慢
- 純 Gemini 方案: 零額外依賴，與現有架構一致

**理由**: 保持與現有架構一致，無需額外依賴或付費服務。

### 2. 輸出格式

**決策**: 去背/切割模式輸出結構化結果，包含：
- `mask`: Gemini 輸出的座標資訊（JSON）
- `processedImage`: Canvas 處理後的 base64 圖片

**理由**: 提供原始座標供進階使用，同時提供處理好的圖片供一般使用者下載。

### 3. Prompt 設計

**去背景 prompt**: 要求 Gemini 識別主要物體並輸出邊界多邊形座標（JSON 格式）
**人物切割 prompt**: 要求 Gemini 識別圖片中的人物並輸出輪廓座標（JSON 格式）

### 4. 結果類型區分

**決策**: 新增 `ScreenshotAnalysis.resultType` 欄位區分文字結果和圖片結果。

- `text`: 現有模式（explain, ocr, translate）
- `image`: 新模式（remove-bg, segment-person）

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Gemini 座標輸出精確度有限 | 明確告知使用者這是 AI 輔助功能，非專業去背工具 |
| JSON 解析可能失敗 | 加入錯誤處理和重試機制 |
| Canvas 處理效能 | 限制圖片大小，使用 Web Worker 處理（未來優化） |
| 破壞性變更影響現有用戶 | 舊的 code/error 分析紀錄保留但無法重新執行 |

## Implementation Notes

1. **類型更新**: 修改 `AnalysisMode` union type
2. **Service 擴展**: 新增圖片處理邏輯到 `screenshotAnalysis.ts`
3. **UI 組件**: 更新 `AnalysisModeSelector` 圖示對應
4. **結果顯示**: `AnalysisResult` 需支援顯示處理後圖片和下載功能
5. **i18n**: 更新所有語言檔案的翻譯
