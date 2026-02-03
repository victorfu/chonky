## 1. 簡化 LoginPage UI

- [x] 1.1 移除 login/register tabs 和 mode 狀態
- [x] 1.2 移除 email/password 表單欄位和相關狀態 (email, fullName, password, confirmPassword, showPassword)
- [x] 1.3 移除表單驗證邏輯 (validate function)
- [x] 1.4 移除 handleSubmit 函數
- [x] 1.5 保留 Google 登入按鈕和 handleGoogleSignIn
- [x] 1.6 移除「或」分隔線和底部切換連結

## 2. 清理 Auth Store

- [x] 2.1 移除 `register` action
- [x] 2.2 移除 `login` action
- [x] 2.3 更新 AuthStore interface 移除相關 action types

## 3. 清理 Firebase Auth Service

- [x] 3.1 移除 `registerWithEmail` 函數
- [x] 3.2 移除 `loginWithEmail` 函數
- [x] 3.3 移除 `createUserWithEmailAndPassword` 和 `signInWithEmailAndPassword` imports
- [x] 3.4 移除不再需要的 error codes (email-already-in-use, weak-password, wrong-password 等)

## 4. 清理 Types

- [x] 4.1 移除 `StoredUser` interface
- [x] 4.2 移除 `LoginCredentials` interface
- [x] 4.3 移除 `RegisterCredentials` interface

## 5. 清理 i18n

- [x] 5.1 移除 en-US.json 中不再使用的 auth keys
- [x] 5.2 移除 zh-TW.json 中不再使用的 auth keys
- [x] 5.3 移除 ja-JP.json 中不再使用的 auth keys

## 6. 清理 Imports 和驗證

- [x] 6.1 移除 LoginPage 中不再使用的 imports (Eye, EyeOff, Input, validators)
- [x] 6.2 確認 validators.ts 是否被其他檔案使用，如無則可考慮移除
- [x] 6.3 執行 TypeScript 編譯確認無錯誤
- [x] 6.4 手動測試 Google 登入流程正常運作
