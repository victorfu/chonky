## Context

目前的認證系統同時支援兩種登入方式：
1. **Google OAuth** - 透過 Firebase Authentication 的 popup 流程
2. **Email/Password** - 透過 Firebase Authentication 的帳號密碼功能

LoginPage 有 login/register tabs、表單欄位、驗證邏輯等複雜的 UI 狀態管理。這次變更要簡化為只保留 Google 登入。

## Goals / Non-Goals

**Goals:**
- 移除所有 email/password 相關的程式碼
- 簡化 LoginPage UI 為單一 Google 登入按鈕
- 清理不再使用的 types、i18n keys、store actions
- 保持現有 Google 登入功能完全不變

**Non-Goals:**
- 不修改 Google 登入的實作方式
- 不處理已註冊的 email/password 使用者遷移（假設沒有正式用戶）
- 不新增其他 OAuth providers

## Decisions

### 1. 直接刪除而非 soft deprecation

**決定**: 直接移除 email/password 相關程式碼

**原因**: 這是開發中的專案，沒有需要維護向後相容性的正式用戶。直接刪除可以保持程式碼乾淨。

### 2. LoginPage 簡化策略

**決定**: 保留現有的 LoginPage 結構，但移除表單和 tabs，只保留：
- Logo 和歡迎文字
- Google 登入按鈕
- 錯誤訊息顯示

**原因**: 維持一致的視覺風格，同時大幅簡化程式碼。

### 3. i18n keys 清理

**決定**: 移除所有 email/password 相關的翻譯 keys

**原因**: 避免維護死程式碼，保持翻譯檔案整潔。

## Risks / Trade-offs

**[未來可能需要其他登入方式]** → 現在不處理，如果需要可以重新實作。目前優先簡化。

**[移除 validators 可能影響其他功能]** → 需要確認 `isValidEmail`、`isRequired`、`minLength` 是否被其他地方使用，只移除確定沒用到的。
