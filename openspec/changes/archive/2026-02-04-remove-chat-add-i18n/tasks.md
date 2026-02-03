## 1. Remove Chat Components and Files

- [x] 1.1 Delete `/src/components/chat/` directory (all 11 files)
- [x] 1.2 Delete `/src/stores/useChatStore.ts`
- [x] 1.3 Delete `/src/types/chat.ts`
- [x] 1.4 Delete `/src/components/settings/ChatSettings.tsx`

## 2. Update Routing and Navigation

- [x] 2.1 Update `/src/App.tsx`: Remove `/chat` route, change default redirect from `/chat` to `/analyze`
- [x] 2.2 Update `/src/components/layout/SidebarNav.tsx`: Remove "New Chat" button and chat nav item
- [x] 2.3 Update `/src/components/common/CommandPalette.tsx`: Remove "New Chat" and "Go to Chat" actions
- [x] 2.4 Update `/src/components/settings/SettingsPage.tsx`: Remove Chat tab from settings tabs

## 3. Update Barrel Exports and Imports

- [x] 3.1 Update `/src/components/chat/index.ts` or remove if directory deleted
- [x] 3.2 Update `/src/stores/index.ts`: Remove useChatStore export
- [x] 3.3 Update `/src/types/index.ts`: Remove chat types export
- [x] 3.4 Update `/src/components/settings/index.ts`: Remove ChatSettings export if applicable
- [x] 3.5 Verify no remaining imports reference deleted files

## 4. Add i18n Translation Keys

- [x] 4.1 Add screenshot i18n keys to `/src/i18n/locales/en-US.json`
- [x] 4.2 Add screenshot i18n keys to `/src/i18n/locales/zh-TW.json`
- [x] 4.3 Add screenshot i18n keys to `/src/i18n/locales/ja-JP.json`

## 5. Remove Chat i18n Keys

- [x] 5.1 Remove `chat.*` keys from `/src/i18n/locales/en-US.json`
- [x] 5.2 Remove `chat.*` keys from `/src/i18n/locales/zh-TW.json`
- [x] 5.3 Remove `chat.*` keys from `/src/i18n/locales/ja-JP.json`
- [x] 5.4 Remove chat-related keys from `commandPalette.*`, `settings.chatSettings.*`, `sidebar.recentConversations`, `nav.query` etc.

## 6. Update Screenshot Components with i18n

- [x] 6.1 Update `/src/components/screenshots/ScreenshotPage.tsx`: Use i18n for title/subtitle
- [x] 6.2 Update `/src/components/screenshots/ScreenshotDropzone.tsx`: Use i18n for all text
- [x] 6.3 Update `/src/components/screenshots/AnalysisModeSelector.tsx`: Use i18n for mode labels/descriptions
- [x] 6.4 Update `/src/components/screenshots/AnalysisResult.tsx`: Use i18n for result header and buttons

## 7. Verification

- [x] 7.1 Build passes with no TypeScript errors
- [x] 7.2 Application loads and navigates to `/analyze` by default
- [x] 7.3 All screenshot UI text displays correctly in en-US
- [x] 7.4 All screenshot UI text displays correctly in zh-TW
- [x] 7.5 All screenshot UI text displays correctly in ja-JP
