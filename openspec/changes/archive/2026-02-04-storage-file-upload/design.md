## Context

目前應用程式使用 localStorage 儲存文件內容：
- 文字檔案以純文字儲存
- 二進位檔案（PDF、DOCX）以 base64 編碼儲存
- 受限於 localStorage 5MB 容量限制
- 內容被截斷至 MAX_CONTENT_SIZE (100KB)

Firebase Storage 已在 `src/services/firebase.ts` 初始化並匯出為 `storage`。

## Goals / Non-Goals

**Goals:**
- 使用 Firebase Storage 儲存上傳的檔案
- 提供真實的上傳進度追蹤（取代模擬進度）
- 支援最大 50MB 檔案上傳
- 保持現有 UI 不變

**Non-Goals:**
- 不修改現有 UI 元件（DocumentUploadModal、DocumentUploader、UploadProgressItem）
- 不實作斷點續傳功能
- 不實作檔案下載功能（本次只處理上傳）
- 不處理現有 localStorage 資料的遷移

## Decisions

### 1. 新增 `src/services/fileStorage.ts` 服務

**決定**：建立獨立的 Firebase Storage 服務檔案，而非修改現有 `storage.ts`。

**原因**：
- `storage.ts` 專注於 localStorage 操作，命名空間清晰
- 避免混淆 localStorage 的 storage 與 Firebase Storage
- 方便日後獨立測試和維護

**替代方案**：
- 在 `firebase.ts` 中直接實作 → 會讓 firebase.ts 過於龐大
- 在 `storage.ts` 中新增 → 命名會造成混淆

### 2. 使用 `uploadBytesResumable` 取得真實進度

**決定**：使用 Firebase Storage 的 `uploadBytesResumable` API。

**原因**：
- 提供 `state_changed` 事件監聽器，可取得 `bytesTransferred` 和 `totalBytes`
- 支援暫停/恢復（雖然 non-goal，但保留擴展性）
- 回傳 `UploadTask`，可用於取消上傳

**API 設計**：
```typescript
interface UploadOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

function uploadFile(
  file: File,
  path: string,
  options?: UploadOptions
): Promise<string>  // 回傳下載 URL
```

### 3. Storage 路徑結構

**決定**：使用 `documents/{userId}/{documentId}/{filename}` 路徑結構。

**原因**：
- 按使用者分隔，便於權限控制
- 包含 documentId 避免檔名衝突
- 保留原始檔名便於識別

**替代方案**：
- `documents/{documentId}` → 無法區分使用者
- `users/{userId}/documents/{filename}` → 可能有檔名衝突

### 4. Document interface 的 content 欄位

**決定**：`content` 欄位改為儲存 Firebase Storage 的下載 URL。

**原因**：
- 最小化 interface 改動
- 下載 URL 可直接用於顯示（如 PDF viewer、圖片預覽）
- 保持與現有程式碼的相容性（只是 content 的值不同）

**補充欄位**：新增 `storageRef` 欄位儲存 Storage 路徑，便於刪除檔案。

```typescript
interface Document {
  // ... existing fields
  content: string;      // 改為 Storage 下載 URL
  storageRef?: string;  // Storage 路徑（用於刪除）
}
```

### 5. 錯誤處理策略

**決定**：上傳失敗時設定 status 為 'error' 並保留錯誤訊息。

**處理的錯誤類型**：
- 網路錯誤
- 權限不足（未登入）
- 檔案過大（前端已驗證，作為防禦性檢查）
- Storage quota exceeded

## Risks / Trade-offs

| 風險 | 緩解措施 |
|------|----------|
| **網路中斷導致上傳失敗** | UI 已有重試機制；可考慮未來加入斷點續傳 |
| **Storage 費用增加** | 50MB 限制已在前端驗證；可設定 Storage Rules 做後端驗證 |
| **未登入使用者無法上傳** | 上傳前檢查 auth 狀態，提示使用者登入 |
| **Breaking change 影響現有資料** | 不處理遷移；舊資料保持原樣，新上傳使用新邏輯 |
| **刪除文件時需同步刪除 Storage 檔案** | 在 deleteDocument 中加入 Storage 刪除邏輯 |

## Open Questions

1. ~~是否需要 Storage Security Rules？~~ → 是，需要設定只有登入使用者可上傳到自己的路徑
2. ~~刪除文件時是否需要刪除 Storage 檔案？~~ → 是，避免孤立檔案佔用空間
