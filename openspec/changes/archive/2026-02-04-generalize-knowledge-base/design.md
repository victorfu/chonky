## Context

The Chonky application is currently a dental materials knowledge base system with hardcoded domain-specific constants, types, and UI elements. The dental specialization is isolated in:

- **Constants layer**: `src/constants/dental.ts` - manufacturers, categories, document types
- **Type layer**: Document and KnowledgeBase types with dental-specific fields
- **Component layer**: Filters and display logic for dental metadata
- **Localization layer**: zh-TW, en-US, ja-JP with dental terminology

The goal is to transform this into a general-purpose knowledge base that can work for any domain.

## Goals / Non-Goals

**Goals:**
- Remove all dental-specific terminology from the codebase
- Create a flexible document model that works for any knowledge domain
- Maintain the existing functionality (upload, search, chat, filtering)
- Keep the multilingual support (zh-TW, en-US, ja-JP)

**Non-Goals:**
- Adding new features beyond the domain generalization
- Creating a configurable multi-domain system (just making it generic)
- Database migration tooling (manual cleanup if needed)
- Backwards compatibility with dental-specific document metadata

## Decisions

### Decision 1: Remove dental-specific fields vs. make them optional

**Choice**: Remove dental-specific fields entirely

**Rationale**:
- The application should be truly domain-agnostic
- Optional fields create confusion about what to fill in
- Cleaner codebase without legacy field handling

**Alternatives considered**:
- Make fields optional: Would leave dead code paths and confusing UI

### Decision 2: Replace constants file or delete it

**Choice**: Rename `dental.ts` to `documents.ts` with only generic document types

**Rationale**:
- Keep a single source of truth for document-related constants
- Only retain truly generic options (document types, languages)
- Remove manufacturers and categories (user-created via knowledge bases)

### Decision 3: Localization approach

**Choice**: Update all three locale files with generic terminology

**Rationale**:
- Keep the existing i18n structure
- Replace dental terms with knowledge base terms
- Maintain parity across all three languages

## Risks / Trade-offs

**[Breaking Change]** → Existing documents with dental metadata will lose those fields
- Mitigation: This is acceptable as we're pivoting the application purpose

**[UI Simplification]** → Fewer filter options means less powerful filtering
- Mitigation: Knowledge base filtering remains; document-level filtering becomes tag-based

**[Mock Data]** → Example prompts become less specific
- Mitigation: Use generic document examples that still demonstrate functionality
