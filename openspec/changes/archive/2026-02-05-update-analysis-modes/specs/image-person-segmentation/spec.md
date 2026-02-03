## ADDED Requirements

### Requirement: User can segment person from image

系統 SHALL 提供 `segment-person` 分析模式，讓使用者可以切割圖片中的人物。

#### Scenario: Select segment-person mode
- **WHEN** 使用者在分析模式選擇器中點選「人物切割」
- **THEN** 系統設定當前模式為 `segment-person`
- **THEN** 顯示對應的圖示和描述

#### Scenario: Analyze image with segment-person mode
- **WHEN** 使用者上傳包含人物的圖片並選擇 `segment-person` 模式後點擊分析
- **THEN** 系統使用 Gemini Vision 識別圖片中的人物
- **THEN** 系統輸出人物輪廓的座標（JSON 格式）
- **THEN** 系統使用 Canvas API 處理圖片，保留人物並移除背景
- **THEN** 顯示處理後的人物切割圖片

### Requirement: User can download segmented person image

系統 SHALL 允許使用者下載切割後的人物圖片。

#### Scenario: Download person cutout PNG
- **WHEN** 人物切割分析完成後
- **THEN** 系統顯示下載按鈕
- **WHEN** 使用者點擊下載
- **THEN** 系統下載 PNG 格式的透明背景人物圖片

### Requirement: System handles no person detected

系統 SHALL 在圖片中沒有人物時提供適當的回饋。

#### Scenario: No person in image
- **WHEN** Gemini 在圖片中沒有偵測到人物
- **THEN** 系統顯示訊息說明未偵測到人物
- **THEN** 建議使用者上傳包含人物的圖片

### Requirement: System handles multiple people

系統 SHALL 支援圖片中有多個人物的情況。

#### Scenario: Multiple people detected
- **WHEN** Gemini 在圖片中偵測到多個人物
- **THEN** 系統切割所有偵測到的人物
- **THEN** 顯示包含所有人物的處理結果
