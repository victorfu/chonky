## Why

目前登入頁面同時支援 Google 登入和 email/password 登入/註冊，但我們只需要 Google 登入。移除 email/password 功能可以簡化程式碼、減少維護負擔，並提供更簡潔的使用者體驗。

## What Changes

- **移除** email/password 註冊功能
- **移除** email/password 登入功能
- **移除** 登入/註冊 tabs 切換 UI
- **簡化** LoginPage 為只有 Google 登入按鈕
- **移除** 相關的表單驗證邏輯和狀態管理
- **移除** firebaseAuth 中的 `registerWithEmail`、`loginWithEmail` 函數
- **移除** authStore 中的 `register`、`login` actions
- **移除** 不再需要的 types（`StoredUser`、`LoginCredentials`、`RegisterCredentials`）
- **移除** 不再需要的 i18n keys

## Capabilities

### New Capabilities

（無新功能）

### Modified Capabilities

（無修改既有 spec）

## Impact

- **UI**: `src/components/auth/LoginPage.tsx` - 大幅簡化
- **Services**: `src/services/firebaseAuth.ts` - 移除 email/password 相關函數
- **Store**: `src/stores/useAuthStore.ts` - 移除 `register`、`login` actions
- **Types**: `src/types/auth.ts` - 移除 `StoredUser`、`LoginCredentials`、`RegisterCredentials`
- **i18n**: `src/i18n/locales/*.json` - 移除不再需要的 auth 相關翻譯
- **Utils**: 可能可以移除 `src/utils/validators.ts` 中不再使用的驗證函數
