## Why

The current codebase is designed specifically for dental materials (牙材) knowledge management. To broaden the application's use cases and make it a general-purpose document knowledge base system, we need to remove all dental-specific terminology, configurations, and UI elements.

## What Changes

- **BREAKING**: Remove dental-specific document metadata fields (manufacturer, productName, productCode, dentalDocType)
- **BREAKING**: Remove hardcoded dental manufacturers list and material categories
- Replace dental-focused UI labels and placeholders with generic knowledge base terminology
- Update all localization files (zh-TW, en-US, ja-JP) to use domain-agnostic text
- Remove dental-specific document type filters and replace with generic document filters
- Update mock data and example prompts to be domain-neutral
- Rename/refactor type aliases that reference "dental" or "material" terminology

## Capabilities

### New Capabilities

- `generic-document-model`: Define a flexible, domain-agnostic document metadata structure that can work for any knowledge base use case

### Modified Capabilities

(No existing specs are affected at the requirement level - this is primarily a domain terminology change)

## Impact

**Code Changes:**
- `src/constants/dental.ts` - Complete overhaul or removal
- `src/types/document.ts` - Remove dental-specific fields
- `src/types/knowledgeBase.ts` - Remove dental aliases
- `src/components/documents/DocumentFilters.tsx` - Remove dental filters
- `src/components/documents/DocumentPreviewPanel.tsx` - Remove product info section
- `src/components/documents/DocumentUploadModal.tsx` - Update default metadata
- `src/components/chat/ChatWelcome.tsx` - Update example prompts
- `src/utils/mockData.ts` - Replace dental examples

**Localization:**
- `src/i18n/locales/zh-TW.json`
- `src/i18n/locales/en-US.json`
- `src/i18n/locales/ja-JP.json`

**APIs/Database:**
- Document schema changes may require database migration if documents with dental fields exist
