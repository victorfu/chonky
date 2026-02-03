## 1. Firebase Storage Service

- [x] 1.1 Create `src/services/fileStorage.ts` with `uploadFile` function that uses `uploadBytesResumable`
- [x] 1.2 Implement `onProgress` callback to report real-time upload progress
- [x] 1.3 Implement error handling for network errors, permission denied, and quota exceeded
- [x] 1.4 Create `deleteFile` function to delete files from Storage by path

## 2. Document Type Updates

- [x] 2.1 Add optional `storageRef` field to Document interface in `src/types/document.ts`

## 3. Upload Flow Integration

- [x] 3.1 Update `processUploadQueue` in `useDocumentStore.ts` to use `uploadFile` instead of reading file content locally
- [x] 3.2 Replace simulated progress (10%, 50%, 75%) with real progress from Firebase Storage callback
- [x] 3.3 Store download URL in `content` field and storage path in `storageRef` field

## 4. Document Deletion

- [x] 4.1 Update `deleteDocument` in `useDocumentStore.ts` to call `deleteFile` when `storageRef` exists
- [x] 4.2 Handle Storage deletion failure gracefully (log error, proceed with deletion)

## 5. Authentication Check

- [x] 5.1 Add authentication check in `uploadFile` - reject if user is not authenticated
