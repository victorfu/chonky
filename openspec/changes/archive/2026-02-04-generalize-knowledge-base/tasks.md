## 1. Type Definitions

- [x] 1.1 Remove dental-specific fields from Document interface in `src/types/document.ts` (manufacturer, productName, productCode, dentalDocType, language)
- [x] 1.2 Remove MaterialCategory and CategoryStats type aliases from `src/types/knowledgeBase.ts`
- [x] 1.3 Remove dental-related type imports and exports

## 2. Constants

- [x] 2.1 Rename `src/constants/dental.ts` to `src/constants/documents.ts`
- [x] 2.2 Remove MANUFACTURERS constant array
- [x] 2.3 Remove DEFAULT_CATEGORIES constant array
- [x] 2.4 Remove or generalize DENTAL_DOCUMENT_TYPES (keep only generic types if needed)
- [x] 2.5 Update imports throughout codebase to use new constants file

## 3. Document Components

- [x] 3.1 Remove manufacturer filter from `src/components/documents/DocumentFilters.tsx`
- [x] 3.2 Remove dental document type filter from DocumentFilters
- [x] 3.3 Remove language filter from DocumentFilters (or make generic)
- [x] 3.4 Remove "Product Information" section from `src/components/documents/DocumentPreviewPanel.tsx`
- [x] 3.5 Update default metadata in `src/components/documents/DocumentUploadModal.tsx`

## 4. Localization

- [x] 4.1 Update `src/i18n/locales/zh-TW.json` - replace dental terminology with generic KB terms
- [x] 4.2 Update `src/i18n/locales/en-US.json` - ensure all text is domain-agnostic
- [x] 4.3 Update `src/i18n/locales/ja-JP.json` - replace dental terminology with generic KB terms
- [x] 4.4 Remove the "dental" section from all locale files

## 5. Chat & Mock Data

- [x] 5.1 Update quick action prompts in `src/components/chat/ChatWelcome.tsx` to be generic
- [x] 5.2 Update mock responses in `src/utils/mockData.ts` to use generic examples
- [x] 5.3 Replace dental product examples with generic document examples

## 6. Store & Utilities

- [x] 6.1 Remove dental terminology from `src/stores/useKnowledgeBaseStore.ts` (useCategoryStore alias)
- [x] 6.2 Update any utility functions that reference dental-specific fields

## 7. Verification

- [x] 7.1 Run TypeScript compilation to verify no type errors
- [x] 7.2 Search codebase for remaining "dental", "manufacturer", "牙" references
- [x] 7.3 Test document upload flow works without dental fields
- [x] 7.4 Test document filtering works with remaining generic filters
