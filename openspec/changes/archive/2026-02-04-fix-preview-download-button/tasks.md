## 1. Create Download Utility

- [x] 1.1 Create `handleDocumentDownload` utility function in `src/utils/fileHelpers.ts` that accepts document metadata and optional URL, and triggers browser download

## 2. Fix Preview Panel Download

- [x] 2.1 Add download handler to DocumentPreviewPanel.tsx that uses the new utility
- [x] 2.2 Wire up onClick handler to the download button (lines 217-224)

## 3. Fix Document List Download

- [x] 3.1 Add download handler to DocumentItem.tsx dropdown menu action
- [x] 3.2 Verify download works from document list view

## 4. Verification

- [x] 4.1 Test download from preview panel for all document types (PDF, DOCX, TXT, MD, CSV, JSON)
- [x] 4.2 Test download from document list action menu
