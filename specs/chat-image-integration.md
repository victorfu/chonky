# Spec: Integrate Image Analysis into Chat Homepage

## Overview

Merge the `/analyze` page functionality into the chat homepage (`/`). When a user attaches an image to the conversation, quick action buttons appear for one-tap analysis (Explain, OCR, Translate, Remove BG), and the user can also type a free-form question about the image. Results appear inline as chat messages.

## Current State

| Aspect | Chat (`/`) | Analyze (`/analyze`) |
|---|---|---|
| Input | Text only (`ChatComposer`) | Image only (`ScreenshotDropzone`) |
| AI call | `chatProvider.generateAssistantReply` (text-in, text-out) | `screenshotAnalysis.analyzeScreenshot` (image+prompt, streaming text/image-out) |
| State | `useChatStore` (Firestore-synced messages) | `useScreenshotStore` (local only, IndexedDB draft) |
| Output | Text bubbles (`ChatMessageBubble`) | Markdown or processed image (`AnalysisResult`) |

## Goals

1. User can attach an image in the chat composer area (drag-drop, paste, file picker).
2. When an image is attached, **quick action chips** appear above the composer: Explain, OCR, Translate, Remove BG.
3. User can tap a chip to run that analysis immediately, OR type a custom prompt and send.
4. The user message shows the image thumbnail + any text. The assistant message shows the analysis result (markdown or processed image).
5. Keep the `/analyze` page working as-is (no regression). Shared logic is extracted, not duplicated.

## Non-Goals

- Multi-image attachments in a single message.
- Image-aware conversational memory (subsequent messages won't re-reference the image).

---

## Data Model Changes

### `ChatMessage` (types/chat.ts)

```ts
export interface ChatMessageAttachment {
  type: 'image';
  /** Firebase Storage download URL (persisted) or base64 data URL (before upload completes) */
  url: string;
  mimeType: string;
  /** Firebase Storage path (e.g. "chat_images/{uid}/{messageId}.png") */
  storagePath?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status: ChatMessageStatus;
  createdAt: string;
  createdAtMs: number;
  model?: ModelType;
  // ---- new fields ----
  /** Image attachment. URL persisted to Firestore, image file stored in Firebase Storage. */
  attachment?: ChatMessageAttachment;
  /** For assistant messages: 'text' (default) or 'image' (e.g. remove-bg result) */
  resultType?: 'text' | 'image';
  /** For assistant messages with resultType='image': processed image data URL or Storage URL */
  processedImageData?: string;
}
```

### Firestore Schema Changes

**User message documents** gain an optional `attachment` field:

```ts
{
  role: 'user',
  content: string,         // text portion only
  status: 'sent',
  attachment?: {
    type: 'image',
    url: string,           // Firebase Storage download URL
    mimeType: string,
    storagePath: string,   // path in Storage for cleanup/deletion
  },
  // ...existing fields
}
```

**Image storage**: Images are uploaded to Firebase Storage at `chat_images/{uid}/{messageId}.{ext}`. The download URL is stored in the Firestore message document so images are visible across devices and sessions.

**Assistant message documents** with image results (e.g. remove-bg) also store the processed image in Firebase Storage and persist the URL in `processedImageData`.

---

## Component Changes

### 1. `ChatComposer` — Add image attachment support

**New props:**

```ts
interface ChatComposerProps {
  // ...existing
  attachment: ChatMessageAttachment | null;
  onAttach: (attachment: ChatMessageAttachment) => void;
  onRemoveAttachment: () => void;
}
```

**UI changes:**

- Add an **attach button** (paperclip icon) to the left of the send button.
- Clicking it opens a file picker (`accept="image/*"`).
- Support **paste** (Ctrl/Cmd+V) to attach an image from clipboard directly into the composer.
- Support **drag-and-drop** onto the composer area.
- When an image is attached, show a **thumbnail preview strip** above the textarea:
  ```
  ┌─────────────────────────────────────┐
  │ [thumbnail 48x48]  image.png   [✕]  │  ← preview strip
  ├─────────────────────────────────────┤
  │ Ask anything about this image...     │  ← textarea (placeholder changes)
  └─────────────────────────────────────┘
  ```
- Placeholder text changes to `"Ask anything about this image..."` when an image is attached.

### 2. `ChatQuickActions` — New component

Appears **between the preview strip and the textarea** when an image is attached and no text has been typed yet.

```
┌─────────────────────────────────────────┐
│ [thumbnail]  screenshot.png        [✕]  │
├─────────────────────────────────────────┤
│ [Explain] [OCR] [Translate] [Remove BG] │  ← quick actions
├─────────────────────────────────────────┤
│ Or type a question about this image...  │
└─────────────────────────────────────────┘
```

- Reuses the same mode definitions from `types/screenshot.ts` (`ANALYSIS_MODES`, icons, label keys).
- Tapping a chip triggers `onQuickAction(mode: AnalysisMode)` which calls `handleSend` with a synthesized prompt.
- Quick actions **hide** once the user starts typing (the user is composing a custom prompt).
- Quick actions **reappear** if the user clears the text back to empty.

### 3. `ChatMessageBubble` — Render image attachments and image results

**User messages with attachment:**
- Show the image thumbnail (max-height ~200px, rounded) above the text content.
- If no text content, show only the image with a subtle label like the mode name.

**Assistant messages with `resultType === 'image'`:**
- Render the processed image (e.g. transparent PNG from remove-bg) with checkerboard background.
- Add a download button.

**Assistant messages with `resultType === 'text'` (default):**
- Render content as Markdown (use `react-markdown`, same as `AnalysisResult`).
- During streaming: display `streamingContent` from the store with a typing indicator. Once complete, switch to the finalized `content` field.

### 4. `ChatHomePage` — Orchestrate the new flow

- Manage `attachment` state (lifted from composer).
- New handler: `handleQuickAction(mode: AnalysisMode)` — creates a synthetic user message with the image + mode label, calls the analysis service, and appends the result as an assistant message.
- New handler: `handleSendWithImage(text: string)` — when text is sent with an attachment, calls the Gemini API with both image and text as content parts (similar to `analyzeScreenshot` but with a custom prompt).
- After send (either quick action or custom text), clear the attachment.

---

## Service Changes

### `chatProvider.ts` — Add image-aware reply generation

New function (streaming):

```ts
export async function streamImageReply(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  options: { language: Language; model: ModelType },
  onChunk: (fullText: string) => void
): Promise<string>
```

- Uses `getGenerativeModel` + `generateContentStream` with `inlineData` part (same pattern as `screenshotAnalysis.ts`).
- For quick action modes, uses the existing i18n prompt templates from `screenshot.prompts.*`.
- For custom text, wraps the user's text with a language instruction.
- Calls `onChunk` with accumulated text on each stream chunk for real-time display in the chat bubble.
- Returns the final complete text.

### `firebaseStorage.ts` — New service for image uploads

```ts
export async function uploadChatImage(
  uid: string,
  messageId: string,
  dataUrl: string,
  mimeType: string
): Promise<{ downloadUrl: string; storagePath: string }>

export async function deleteChatImage(storagePath: string): Promise<void>
```

- Uploads base64 image data to `chat_images/{uid}/{messageId}.{ext}`.
- Returns the public download URL and storage path.
- `deleteChatImage` used when clearing conversation.

### `screenshotAnalysis.ts` — No changes

Keep as-is. The `/analyze` page continues to use it.

---

## Store Changes

### `useChatStore` — Extend for image messages

New state:

```ts
interface ChatStore {
  // ...existing
  draftAttachment: ChatMessageAttachment | null;
  streamingContent: string;  // live-updated text for the in-progress assistant message

  // ...existing actions
  setDraftAttachment: (attachment: ChatMessageAttachment | null) => void;
  sendMessageWithImage: (text: string, attachment: ChatMessageAttachment, mode?: AnalysisMode) => Promise<void>;
}
```

**`sendMessageWithImage` flow:**

1. Auth check (same as `sendMessage`).
2. Add optimistic user message with `attachment` (base64 data URL initially) + text content.
3. Upload image to Firebase Storage → get download URL.
4. Persist user message to Firestore (text content + `attachment` with Storage URL).
5. Update local user message: replace base64 data URL with Storage download URL.
6. Add optimistic assistant message (empty content, `pending` status).
7. Call `streamImageReply` (or `analyzeScreenshot` for `remove-bg` mode), updating `streamingContent` on each chunk.
8. On stream complete: finalize assistant message content, clear `streamingContent`.
9. For image results (remove-bg): upload processed image to Storage, store URL in `processedImageData`.
10. Persist assistant message to Firestore.
11. Clear `draftAttachment`.

---

## i18n Additions

Add to each locale file under a new `chatHome.imageAttachment` namespace:

```json
{
  "chatHome": {
    "imageAttachment": {
      "placeholder": "Ask anything about this image...",
      "quickActionsLabel": "Quick actions",
      "attachImage": "Attach image",
      "removeAttachment": "Remove",
      "analyzing": "Analyzing image..."
    }
  }
}
```

Reuse existing `screenshot.modes.*` keys for chip labels.

---

## UX Details

### Attachment flow

| Trigger | Behavior |
|---|---|
| Click attach button | Opens file picker (`accept="image/*"`) |
| Ctrl/Cmd+V with image in clipboard | Attaches image, does NOT paste as text |
| Drag file onto composer | Attaches image |
| Click ✕ on preview | Removes attachment, restores normal composer |

### Quick action flow

1. User attaches image → quick action chips appear.
2. User taps "Explain" → immediately sends. User message shows image + "Explain" label. Composer shows loading state. Assistant bubble streams in the explanation.
3. Quick actions disappear after send. Attachment is cleared.

### Custom prompt flow

1. User attaches image → quick action chips appear.
2. User starts typing → quick actions hide (they can still send with Enter or button).
3. User sends "What programming language is shown here?" → user message shows image + text. Assistant replies with analysis.

### Empty text + no quick action

If user has an image attached and hits Send with empty text, treat it as "Explain" mode (default quick action).

### Error handling

- Auth required → same flow as current chat (save pending state, redirect to login, resume).
- Analysis failure → mark assistant message as `error` status, show error text.

---

## Migration & Cleanup

- **`/analyze` page**: Keep as-is for now. It serves a different UX (standalone tool, no conversation context). Can be deprecated in a future iteration.
- **No database migration needed**: New fields are optional and client-side only.

---

## File Change Summary

| File | Change |
|---|---|
| `src/types/chat.ts` | Add `ChatMessageAttachment`, optional fields on `ChatMessage` |
| `src/stores/useChatStore.ts` | Add `draftAttachment`, `streamingContent`, `setDraftAttachment`, `sendMessageWithImage` |
| `src/services/chatProvider.ts` | Add `streamImageReply` function |
| `src/services/firebaseStorage.ts` | **New** — `uploadChatImage`, `deleteChatImage` |
| `src/components/chat/ChatComposer.tsx` | Add attach button, paste/drop handlers, preview strip |
| `src/components/chat/ChatQuickActions.tsx` | **New** — quick action chips component |
| `src/components/chat/ChatMessageBubble.tsx` | Render image attachments, streaming text, markdown/image results |
| `src/components/chat/ChatHomePage.tsx` | Wire up attachment state, quick action handler, image send handler |
| `src/i18n/locales/zh-TW.json` | Add `chatHome.imageAttachment.*` keys |
| `src/i18n/locales/en-US.json` | Add `chatHome.imageAttachment.*` keys |
| `src/i18n/locales/ja-JP.json` | Add `chatHome.imageAttachment.*` keys |

**No changes to:** `screenshotAnalysis.ts`, `useScreenshotStore.ts`, `/analyze` page components.

---

## Resolved Decisions

1. **Model selector in quick actions?** No. Use the user's default model from settings.
2. **Persist images?** Yes. Upload to Firebase Storage, store download URL in Firestore. Images survive across devices/sessions.
3. **Streaming?** Yes. Image analysis replies stream into the chat bubble in real-time via `streamingContent` in the store.
