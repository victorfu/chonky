## ADDED Requirements

### Requirement: User can remove background from image

系統 SHALL 提供 `remove-bg` 分析模式，讓使用者可以移除圖片背景。

#### Scenario: Select remove-bg mode
- **WHEN** 使用者在分析模式選擇器中點選「去背景」
- **THEN** 系統設定當前模式為 `remove-bg`
- **THEN** 顯示對應的圖示和描述

#### Scenario: Analyze image with remove-bg mode
- **WHEN** 使用者上傳圖片並選擇 `remove-bg` 模式後點擊分析
- **THEN** 系統使用 Gemini Vision 識別圖片主體
- **THEN** 系統輸出主體的邊界座標（JSON 格式）
- **THEN** 系統使用 Canvas API 處理圖片，移除背景
- **THEN** 顯示處理後的透明背景圖片

### Requirement: User can download processed image

系統 SHALL 允許使用者下載去背後的圖片。

#### Scenario: Download transparent PNG
- **WHEN** 去背分析完成後
- **THEN** 系統顯示下載按鈕
- **WHEN** 使用者點擊下載
- **THEN** 系統下載 PNG 格式的透明背景圖片

### Requirement: System handles recognition failures gracefully

系統 SHALL 在無法識別主體時提供適當的錯誤訊息。

#### Scenario: No clear subject detected
- **WHEN** Gemini 無法識別圖片中的明確主體
- **THEN** 系統顯示友善的錯誤訊息，說明無法識別主體
- **THEN** 建議使用者嘗試其他圖片或手動裁切
