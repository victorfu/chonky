## Why

The download button in the document preview panel (`DocumentPreviewPanel.tsx`) does not work - it renders but has no `onClick` handler. Similarly, the download menu item in `DocumentItem.tsx` has an empty handler. Users cannot download files from the preview or list views, which is a core file management feature.

## What Changes

- Add functional download handler to the preview panel download button in `DocumentPreviewPanel.tsx`
- Add functional download handler to the document list item action menu in `DocumentItem.tsx`
- Reuse existing download utilities from `fileHelpers.ts` and patterns from `DocumentViewer.tsx`

## Capabilities

### New Capabilities

None - this is a bug fix that connects existing UI to existing functionality.

### Modified Capabilities

None - no spec-level behavior changes, only implementation completion.

## Impact

- **Components**: `DocumentPreviewPanel.tsx`, `DocumentItem.tsx`
- **Dependencies**: Will use existing `downloadFile()` from `fileHelpers.ts` and Firebase Storage URLs
- **User Experience**: Users will be able to download files from preview panel and document list actions
