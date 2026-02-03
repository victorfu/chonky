## Why

目前文件上傳使用 localStorage 暫存檔案內容（base64），受限於 5MB 容量限制且內容被截斷至 100KB。需要改用 Firebase Storage 實現真正的雲端檔案儲存，突破容量限制並支援跨裝置存取。

## What Changes

- 新增 Firebase Storage 上傳服務，支援真實上傳進度追蹤
- 修改 `useDocumentStore` 的上傳流程，改為上傳至 Firebase Storage
- 文件 metadata 改存 Firestore，檔案內容存 Firebase Storage
- 移除 localStorage 中的檔案內容儲存（base64）
- **BREAKING**: Document 的 `content` 欄位改為 Storage URL，不再是檔案內容

## Capabilities

### New Capabilities

- `file-storage`: Firebase Storage 檔案上傳/下載服務，包含上傳進度追蹤、檔案驗證、錯誤處理

### Modified Capabilities

- (無需修改現有 specs，UI 保持不變)

## Impact

**受影響的程式碼：**
- `src/services/storage.ts` - 需新增 Firebase Storage 操作（或建立新檔案）
- `src/stores/useDocumentStore.ts` - `processUploadQueue()` 改用真實上傳
- `src/utils/fileHelpers.ts` - 可能需要調整檔案讀取邏輯
- `src/types/document.ts` - Document interface 的 content 欄位語意改變

**支援規格：**
- 檔案格式：.pdf, .docx, .doc, .txt, .md, .csv, .json
- 最大檔案大小：50 MB
- 上傳進度：使用 Firebase Storage 的 `uploadBytesResumable` 取得真實進度

**現有 UI 保持不變：**
- `DocumentUploadModal.tsx`
- `DocumentUploader.tsx`
- `UploadProgressItem.tsx`
