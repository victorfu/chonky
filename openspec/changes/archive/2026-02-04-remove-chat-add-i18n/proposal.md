## Why

The application currently has multiple features (Chat, Screenshot Analysis), but the focus should be solely on the Screenshot Analysis (Analyze) feature. Chat functionality is being deprecated, and all remaining UI text needs full i18n support across all three languages (en-US, zh-TW, ja-JP) to ensure consistent localization.

## What Changes

- **BREAKING**: Remove the `/chat` route and redirect default route from `/chat` to `/analyze`
- **BREAKING**: Remove all chat-related components (`/src/components/chat/` directory)
- **BREAKING**: Remove chat store (`useChatStore.ts`) and chat types (`chat.ts`)
- **BREAKING**: Remove "New Chat" button from sidebar navigation
- **BREAKING**: Remove chat-related command palette actions (new chat, go to chat)
- **BREAKING**: Remove Chat Settings tab from settings page
- Remove chat-related i18n keys from all language files
- Add missing screenshot-related i18n keys to all three language files (en-US, zh-TW, ja-JP)
- Ensure all remaining UI components use i18n for text display

## Capabilities

### New Capabilities

- `i18n-support`: Full internationalization support for all UI text in the screenshot analysis feature, including analysis modes, dropzone UI, error messages, and results display

### Modified Capabilities

None - this change removes features without modifying existing spec-level behavior of the remaining functionality.

## Impact

**Components to Remove:**
- `/src/components/chat/` (11 files: ChatPage, ChatContainer, ChatInput, MessageList, etc.)
- `/src/components/settings/ChatSettings.tsx`

**Stores to Remove:**
- `/src/stores/useChatStore.ts`

**Types to Remove:**
- `/src/types/chat.ts`

**Files to Modify:**
- `/src/App.tsx` - Remove chat route, change default redirect
- `/src/components/layout/SidebarNav.tsx` - Remove New Chat button
- `/src/components/common/CommandPalette.tsx` - Remove chat-related actions
- `/src/components/settings/SettingsPage.tsx` - Remove Chat tab
- `/src/i18n/locales/en-US.json` - Remove chat keys, add screenshot keys
- `/src/i18n/locales/zh-TW.json` - Remove chat keys, add screenshot keys
- `/src/i18n/locales/ja-JP.json` - Remove chat keys, add screenshot keys
- `/src/components/screenshots/*.tsx` - Add i18n hooks where missing

**i18n Keys to Add:**
- `screenshot.title`, `screenshot.subtitle`
- `screenshot.dropzone.*` (title, subtitle, pasteFromClipboard, selectFile)
- `screenshot.analyze`, `screenshot.analyzing`, `screenshot.clear`
- `screenshot.modes.*` (explain, ocr, code, error, translate)
- `screenshot.result`, `screenshot.reanalyze`
- `screenshot.errors.*` (invalidFileType, readError, clipboardError, noImageInClipboard)
- `nav.analyze`

**No API Changes** - Backend services remain unchanged. This is purely a frontend scope reduction.
