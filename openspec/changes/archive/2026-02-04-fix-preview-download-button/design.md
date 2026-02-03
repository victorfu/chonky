## Context

The document management UI has download buttons in two locations that are not functional:
1. **DocumentPreviewPanel.tsx** (line 217-224): Download button in the preview panel footer - no onClick handler
2. **DocumentItem.tsx** (line 56): Download action in the dropdown menu - empty onClick handler

Working download implementations already exist in:
- **DocumentViewer.tsx** (line 312-324): Full download handler using `downloadFile()` utility
- **ViewerToolbar.tsx**: Passes `onDownload` callback to the viewer

## Goals / Non-Goals

**Goals:**
- Wire up download button in DocumentPreviewPanel to trigger file download
- Wire up download action in DocumentItem dropdown menu
- Reuse existing download patterns and utilities

**Non-Goals:**
- Adding batch download functionality (already has placeholder in DocumentsPage.tsx)
- Changing download behavior or file formats
- Adding download progress indicators

## Decisions

### 1. Reuse existing download pattern from DocumentViewer

**Decision**: Copy the download approach from `DocumentViewer.tsx:handleDownload` - use `downloadFile()` for text-based files, anchor element for binary files.

**Rationale**: This pattern already handles all document types correctly and uses the existing utility functions.

### 2. Pass document URL and type to components

**Decision**: Both DocumentPreviewPanel and DocumentItem need access to the document's storage URL (or content) to trigger downloads.

**Rationale**: DocumentPreviewPanel already receives the full `document` object. DocumentItem also has access to document data via props.

### 3. Create shared download handler utility

**Decision**: Extract a reusable `handleDocumentDownload(document, documentUrl?)` function to avoid duplication.

**Rationale**: The same download logic is needed in multiple places. Centralizing it prevents bugs and inconsistencies.

## Risks / Trade-offs

**[Risk]** Binary files require a URL that may need to be fetched from Firebase Storage
→ **Mitigation**: Check if URL exists in document object; if not, fetch via `getDownloadURL()` before download

**[Risk]** Text content may not be available in preview panel context
→ **Mitigation**: For preview panel, always use the URL-based download (anchor element approach) which works for all file types
