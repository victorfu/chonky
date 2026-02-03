## Context

The application is a React + TypeScript web app with:
- React Router 6 for routing (`/chat`, `/analyze`, `/settings`)
- Zustand for state management (useChatStore, useScreenshotStore, useSettingsStore)
- i18next for internationalization (3 locales: en-US, zh-TW, ja-JP)
- Firebase for authentication and Gemini AI services

Currently, the chat feature is fully implemented but needs to be removed. The screenshot analysis feature exists but lacks comprehensive i18n coverage - many strings are hardcoded in components rather than using translation keys.

## Goals / Non-Goals

**Goals:**
- Completely remove chat functionality from the codebase
- Ensure all remaining UI text uses i18n translation keys
- Maintain working screenshot analysis feature
- Keep the application functional after removal (no broken imports/routes)

**Non-Goals:**
- Adding new features to screenshot analysis
- Changing the visual design or layout
- Modifying backend/API services
- Adding new languages beyond the existing three

## Decisions

### Decision 1: Delete vs Deprecate Chat Code

**Choice**: Complete deletion of all chat-related files

**Rationale**:
- No backwards compatibility needed - this is a feature removal
- Keeping deprecated code increases maintenance burden
- Clean deletion prevents accidental usage

**Alternatives Considered**:
- Feature flag to disable: Rejected - adds complexity for no benefit
- Keep code but remove routes: Rejected - dead code clutters codebase

### Decision 2: Default Route After Chat Removal

**Choice**: Redirect `/` to `/analyze`

**Rationale**:
- Analyze is now the primary feature
- Simple redirect maintains familiar pattern
- No need for a separate landing page

### Decision 3: i18n Key Structure for Screenshots

**Choice**: Use nested namespace `screenshot.*` matching existing patterns

**Rationale**:
- Consistent with existing `chat.*`, `auth.*` namespaces
- Logical grouping by feature
- Easy to maintain and extend

**Key Structure**:
```
screenshot.
  title
  subtitle
  dropzone.
    title
    subtitle
    pasteFromClipboard
    selectFile
  modes.
    explain / ocr / code / error / translate
  analyze
  analyzing
  clear
  result
  reanalyze
  errors.
    invalidFileType
    readError
    clipboardError
    noImageInClipboard
```

### Decision 4: Handling Settings Tab Removal

**Choice**: Remove entire ChatSettings component and tab

**Rationale**:
- Chat settings are irrelevant without chat feature
- Cleaner than leaving an empty/disabled tab

## Risks / Trade-offs

**Risk**: Broken imports after file deletion
→ **Mitigation**: Update all barrel exports (`index.ts` files) and verify no dangling imports

**Risk**: Missing translations causing fallback to keys in UI
→ **Mitigation**: Add all required translation keys before removing hardcoded strings; test all three locales

**Risk**: Users with saved chat state in localStorage
→ **Mitigation**: Chat data in localStorage can remain (harmless); no migration needed since feature is fully removed

**Trade-off**: Losing chat conversation history
→ Accepted: This is intentional - chat feature is being deprecated
