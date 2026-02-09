import { create } from 'zustand';
import { createStore, del, get, set } from 'idb-keyval';
import type { ChatMessage, ChatMessageAttachment } from '@/types';
import type { AnalysisMode } from '@/types/screenshot';
import {
  addChatMessage,
  clearChatMessages,
  ensureDefaultChat,
  subscribeChatMessages,
} from '@/services/firestoreChat';
import { generateAssistantReply } from '@/services/chatProvider';
import { deleteChatImage } from '@/services/firebaseStorage';
import { processImageMessage, createPipelineTracker } from '@/services/chatImagePipeline';
import { useAuthStore } from './useAuthStore';
import { useSettingsStore } from './useSettingsStore';

const PENDING_CHAT_MESSAGE_KEY = 'pending-chat-message';
const AUTH_REQUIRED_ERROR_CODE = 'AUTH_REQUIRED';
const MAX_PENDING_RETRIES = 3;
const pendingChatStore = createStore('chonky-chat', 'pending');

type AuthRequiredError = Error & { code: typeof AUTH_REQUIRED_ERROR_CODE };
type PendingChatMessage =
  | { kind: 'text'; text: string; _retryCount?: number }
  | {
      kind: 'image';
      text: string;
      attachment: ChatMessageAttachment;
      mode?: AnalysisMode;
      _retryCount?: number;
    };

function isAnalysisMode(value: unknown): value is AnalysisMode {
  return value === 'explain' || value === 'ocr' || value === 'translate' || value === 'remove-bg';
}

function isChatMessageAttachment(value: unknown): value is ChatMessageAttachment {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    obj.type === 'image' &&
    typeof obj.url === 'string' &&
    obj.url !== '' &&
    typeof obj.mimeType === 'string' &&
    obj.mimeType !== '' &&
    (!('localBlob' in obj) || obj.localBlob == null || obj.localBlob instanceof Blob) &&
    (!('storagePath' in obj) || obj.storagePath == null || typeof obj.storagePath === 'string')
  );
}

function revokeLocalAttachmentObjectUrl(attachment: ChatMessageAttachment | null | undefined) {
  if (!attachment?.localBlob || !attachment.url.startsWith('blob:') || typeof URL === 'undefined') {
    return;
  }
  URL.revokeObjectURL(attachment.url);
}

function parsePendingMessage(raw: string): PendingChatMessage | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === 'object' && parsed !== null) {
      const obj = parsed as Record<string, unknown>;

      if (obj.kind === 'text' && typeof obj.text === 'string') {
        const text = (obj.text as string).trim();
        const rc = obj._retryCount;
        const _retryCount = typeof rc === 'number' ? rc : undefined;
        return text ? { kind: 'text', text, _retryCount } : null;
      }

      if (
        obj.kind === 'image' &&
        typeof obj.text === 'string' &&
        isChatMessageAttachment(obj.attachment)
      ) {
        const mode = isAnalysisMode(obj.mode) ? obj.mode : undefined;
        const rc = obj._retryCount;
        const _retryCount = typeof rc === 'number' ? rc : undefined;
        return {
          kind: 'image',
          text: obj.text as string,
          attachment: obj.attachment as ChatMessageAttachment,
          mode,
          _retryCount,
        };
      }
    }
  } catch (err) {
    // Backward compatibility for previous plain-string pending payloads.
    console.warn('[useChatStore] Failed to parse pending message JSON, falling back to text:', err);
  }

  return { kind: 'text', text: trimmed };
}

function normalizePendingMessage(value: unknown): PendingChatMessage | null {
  if (typeof value === 'string') {
    return parsePendingMessage(value);
  }

  if (typeof value !== 'object' || value === null) return null;
  const obj = value as Record<string, unknown>;

  if (obj.kind === 'text' && typeof obj.text === 'string') {
    const text = (obj.text as string).trim();
    const rc = obj._retryCount;
    const _retryCount = typeof rc === 'number' ? rc : undefined;
    return text ? { kind: 'text', text, _retryCount } : null;
  }

  if (
    obj.kind === 'image' &&
    typeof obj.text === 'string' &&
    isChatMessageAttachment(obj.attachment)
  ) {
    const mode = isAnalysisMode(obj.mode) ? obj.mode : undefined;
    const rc = obj._retryCount;
    const _retryCount = typeof rc === 'number' ? rc : undefined;
    return {
      kind: 'image',
      text: obj.text as string,
      attachment: obj.attachment as ChatMessageAttachment,
      mode,
      _retryCount,
    };
  }

  return null;
}

function createAuthRequiredError(): AuthRequiredError {
  const error = new Error('Authentication is required to send messages') as AuthRequiredError;
  error.code = AUTH_REQUIRED_ERROR_CODE;
  return error;
}

export function isAuthRequiredError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === AUTH_REQUIRED_ERROR_CODE
  );
}

async function loadPendingMessage(): Promise<PendingChatMessage | null> {
  try {
    const message = await get(PENDING_CHAT_MESSAGE_KEY, pendingChatStore);
    return normalizePendingMessage(message);
  } catch (err) {
    console.error('[useChatStore] loadPendingMessage failed:', err);
    return null;
  }
}

async function savePendingMessage(message: PendingChatMessage): Promise<void> {
  try {
    await set(PENDING_CHAT_MESSAGE_KEY, message, pendingChatStore);
  } catch (err) {
    console.error('[useChatStore] savePendingMessage failed:', err);
  }
}

async function savePendingTextMessage(message: string): Promise<void> {
  const text = message.trim();
  if (!text) {
    return;
  }
  await savePendingMessage({ kind: 'text', text });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

async function savePendingImageMessage(
  text: string,
  attachment: ChatMessageAttachment,
  mode?: AnalysisMode
): Promise<void> {
  let url = attachment.url;

  // blob: URLs are session-scoped and won't survive a page reload.
  // Convert the local blob to a data URL so the pending message can be recovered.
  if (attachment.localBlob instanceof Blob) {
    try {
      url = await blobToDataUrl(attachment.localBlob);
    } catch (err) {
      console.warn('[useChatStore] Failed to convert blob to data URL for pending message:', err);
      // Do not save a pending message with a dead blob: URL —
      // it cannot be recovered after page reload.
      return;
    }
  }

  await savePendingMessage({
    kind: 'image',
    text,
    attachment: { type: attachment.type, url, mimeType: attachment.mimeType, storagePath: attachment.storagePath },
    mode,
  });
}

async function clearPendingMessage(): Promise<void> {
  try {
    await del(PENDING_CHAT_MESSAGE_KEY, pendingChatStore);
  } catch (err) {
    console.error('[useChatStore] clearPendingMessage failed:', err);
  }
}

function findErrorWithCode(error: unknown): { code: string } | null {
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.code === 'string') {
      return error as { code: string };
    }
  }
  if (error instanceof Error && 'cause' in error) {
    return findErrorWithCode((error as Record<string, unknown>).cause);
  }
  return null;
}

function getChatSendErrorMessage(error: unknown): string {
  const target = findErrorWithCode(error);
  if (target?.code === 'permission-denied') {
    return 'Firestore permission denied. Deploy/update rules for user_chats and ensure current user is authenticated.';
  }

  return error instanceof Error ? error.message : 'Failed to send message';
}

interface ChatStore {
  messages: ChatMessage[];
  draftInput: string;
  draftAttachment: ChatMessageAttachment | null;
  streamingContent: string;
  isInitializing: boolean;
  isSending: boolean;
  error: string | null;

  initialize: () => () => void;
  setDraftInput: (value: string) => void;
  setDraftAttachment: (attachment: ChatMessageAttachment | null) => void;
  sendMessage: (text: string) => Promise<void>;
  sendMessageWithImage: (text: string, attachment: ChatMessageAttachment, mode?: AnalysisMode) => Promise<void>;
  consumePendingMessageAndSend: () => Promise<void>;
  clearConversation: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => {
  let authStoreUnsubscribe: (() => void) | null = null;
  let chatMessagesUnsubscribe: (() => void) | null = null;
  let activeUid: string | null = null;

  return {
    messages: [],
    draftInput: '',
    draftAttachment: null,
    streamingContent: '',
    isInitializing: false,
    isSending: false,
    error: null,

    initialize: () => {
      const bindUserChat = async (uid: string | null) => {
        if (activeUid === uid) {
          return;
        }

        chatMessagesUnsubscribe?.();
        chatMessagesUnsubscribe = null;
        activeUid = uid;

        if (!uid) {
          set({
            messages: [],
            isInitializing: false,
            isSending: false,
            error: null,
          });
          return;
        }

        set({ isInitializing: true, error: null });

        try {
          await ensureDefaultChat(uid);
        } catch (error) {
          console.error('Failed to ensure default chat thread:', error);
          set({
            error: 'Failed to initialize chat',
            isInitializing: false,
          });
          return;
        }

        if (activeUid !== uid) {
          return;
        }

        chatMessagesUnsubscribe = subscribeChatMessages(
          uid,
          (messages) => {
            set({ messages, isInitializing: false });
          },
          (error) => {
            console.error('Failed to subscribe chat messages:', error);
            set({
              error: 'Failed to load chat messages',
              isInitializing: false,
            });
          }
        );
      };

      const initialUid = useAuthStore.getState().user?.id ?? null;
      void bindUserChat(initialUid).then(() => {
        if (initialUid) {
          void get().consumePendingMessageAndSend();
        }
      }).catch((err) => {
        console.error('[useChatStore] bindUserChat (initial) failed:', err);
      });

      authStoreUnsubscribe?.();
      authStoreUnsubscribe = useAuthStore.subscribe((state, previousState) => {
        const uid = state.user?.id ?? null;
        const previousUid = previousState.user?.id ?? null;

        if (uid !== previousUid) {
          void bindUserChat(uid).then(() => {
            if (uid) {
              void get().consumePendingMessageAndSend();
            }
          }).catch((err) => {
            console.error('[useChatStore] bindUserChat (auth change) failed:', err);
          });
        }
      });

      return () => {
        authStoreUnsubscribe?.();
        authStoreUnsubscribe = null;
        chatMessagesUnsubscribe?.();
        chatMessagesUnsubscribe = null;
        activeUid = null;
      };
    },

    setDraftInput: (value) => {
      set({ draftInput: value });
    },

    setDraftAttachment: (attachment) => {
      const previousAttachment = get().draftAttachment;
      if (previousAttachment !== attachment) {
        revokeLocalAttachmentObjectUrl(previousAttachment);
      }
      set({ draftAttachment: attachment });
    },

    sendMessage: async (text) => {
      const content = text.trim();
      if (!content) {
        return;
      }

      const authUid = useAuthStore.getState().user?.id ?? null;
      const uid = activeUid ?? authUid;
      if (!authUid || !uid || uid !== authUid) {
        await savePendingTextMessage(content);
        throw createAuthRequiredError();
      }

      const { language, defaultModel } = useSettingsStore.getState().settings.general;
      const historySnapshot = get().messages;
      const nowMs = Date.now();
      const userTempId = `local-user-${nowMs}`;
      let assistantTempId: string | null = null;

      set((state) => ({
        draftInput: '',
        isSending: true,
        error: null,
        messages: [
          ...state.messages,
          {
            id: userTempId,
            role: 'user',
            content,
            status: 'pending',
            createdAt: new Date(nowMs).toISOString(),
            createdAtMs: nowMs,
            model: defaultModel,
          },
        ],
      }));

      try {
        const persistedUserMessageId = await addChatMessage(uid, {
          role: 'user',
          content,
          status: 'sent',
          model: defaultModel,
          createdAtMs: nowMs,
        });

        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === userTempId
              ? { ...message, id: persistedUserMessageId, status: 'sent' }
              : message
          ),
        }));

        const assistantContent = await generateAssistantReply(content, {
          language,
          model: defaultModel,
          messages: historySnapshot,
        });
        const assistantMs = Date.now();
        const nextAssistantTempId = `local-assistant-${assistantMs}`;
        assistantTempId = nextAssistantTempId;

        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: nextAssistantTempId,
              role: 'assistant',
              content: assistantContent,
              status: 'pending',
              createdAt: new Date(assistantMs).toISOString(),
              createdAtMs: assistantMs,
              model: defaultModel,
            },
          ],
        }));

        const persistedAssistantMessageId = await addChatMessage(uid, {
          role: 'assistant',
          content: assistantContent,
          status: 'sent',
          model: defaultModel,
          createdAtMs: assistantMs,
        });

        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === nextAssistantTempId
              ? { ...message, id: persistedAssistantMessageId, status: 'sent' }
              : message
          ),
        }));
      } catch (error) {
        console.error('Failed to send chat message:', error);
        set((state) => ({
          messages: state.messages.map((message) => {
            if (message.id === userTempId || message.id === assistantTempId) {
              return { ...message, status: 'error' };
            }
            return message;
          }),
          error: getChatSendErrorMessage(error),
        }));
        throw error;
      } finally {
        set({ isSending: false });
      }
    },

    sendMessageWithImage: async (text, attachment, mode) => {
      const authUid = useAuthStore.getState().user?.id ?? null;
      const uid = activeUid ?? authUid;
      if (!authUid || !uid || uid !== authUid) {
        await savePendingImageMessage(text, attachment, mode);
        throw createAuthRequiredError();
      }

      const { language, defaultModel } = useSettingsStore.getState().settings.general;
      const nowMs = Date.now();
      const userTempId = `local-user-${nowMs}`;
      const tracker = createPipelineTracker();
      const shouldRevokeInputObjectUrl = attachment.localBlob instanceof Blob && attachment.url.startsWith('blob:');

      const content = text.trim() || (mode ? `[${mode}]` : '[image]');

      set((state) => ({
        draftInput: '',
        draftAttachment: null,
        isSending: true,
        streamingContent: '',
        error: null,
        messages: [
          ...state.messages,
          {
            id: userTempId,
            role: 'user',
            content,
            status: 'pending',
            createdAt: new Date(nowMs).toISOString(),
            createdAtMs: nowMs,
            model: defaultModel,
            attachment,
          },
        ],
      }));

      try {
        await processImageMessage(
          { uid, content, attachment, mode, userTempId, nowMs, defaultModel, language },
          {
            onAttachmentUploaded: (tempId, persisted) => {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === tempId ? { ...m, attachment: persisted } : m
                ),
              }));
            },
            onUserMessagePersisted: (tempId, persistedId) => {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === tempId ? { ...m, id: persistedId, status: 'sent' } : m
                ),
              }));
            },
            onAssistantMessageCreated: (message) => {
              set((state) => ({
                streamingContent: '',
                messages: [...state.messages, message],
              }));
            },
            onAssistantContentUpdated: (tempId, updatedContent) => {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === tempId ? { ...m, content: updatedContent } : m
                ),
              }));
            },
            onAssistantMessagePersisted: (tempId, persistedId) => {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === tempId ? { ...m, id: persistedId, status: 'sent' } : m
                ),
              }));
            },
            onStreamingChunk: (chunk) => {
              set({ streamingContent: chunk });
            },
            onStreamingDone: () => {
              set({ streamingContent: '' });
            },
          },
          tracker
        );
      } catch (error) {
        const cleanupPaths = Array.from(tracker.uploadedStoragePaths).filter(
          (path) => !tracker.persistedStoragePaths.has(path)
        );
        if (cleanupPaths.length > 0) {
          await Promise.allSettled(cleanupPaths.map((path) => deleteChatImage(path)));
        }

        console.error('Failed to send image message:', error);
        set((state) => ({
          streamingContent: '',
          messages: state.messages.map((message) => {
            if (message.id === userTempId || message.id === tracker.assistantTempId) {
              return { ...message, status: 'error' };
            }
            return message;
          }),
          error: getChatSendErrorMessage(error),
        }));
        throw error;
      } finally {
        if (tracker.processedResultObjectUrl && typeof URL !== 'undefined') {
          URL.revokeObjectURL(tracker.processedResultObjectUrl);
        }
        if (shouldRevokeInputObjectUrl && typeof URL !== 'undefined') {
          URL.revokeObjectURL(attachment.url);
        }
        set({ isSending: false });
      }
    },

    consumePendingMessageAndSend: async () => {
      const pendingMessage = await loadPendingMessage();
      if (!pendingMessage) {
        return;
      }

      const retryCount = pendingMessage._retryCount ?? 0;
      if (retryCount >= MAX_PENDING_RETRIES) {
        console.warn(
          '[useChatStore] Pending message exceeded max retries, discarding:',
          retryCount
        );
        await clearPendingMessage();
        set({ error: 'Your pending message could not be sent after multiple attempts and has been discarded.' });
        return;
      }

      await clearPendingMessage();

      try {
        if (pendingMessage.kind === 'image') {
          await get().sendMessageWithImage(
            pendingMessage.text,
            pendingMessage.attachment,
            pendingMessage.mode
          );
        } else {
          await get().sendMessage(pendingMessage.text);
        }
      } catch (error) {
        if (isAuthRequiredError(error)) {
          // Auth errors: re-save without incrementing (user just needs to log in)
          await savePendingMessage(pendingMessage);
        } else {
          // Non-auth errors: increment retry count
          await savePendingMessage({ ...pendingMessage, _retryCount: retryCount + 1 });
          console.error('[useChatStore] consumePendingMessageAndSend failed:', error);
        }
      }
    },

    clearConversation: async () => {
      const uid = activeUid ?? useAuthStore.getState().user?.id ?? null;

      if (!uid) {
        set({ messages: [] });
        return;
      }

      set({ isSending: true, error: null });
      try {
        await clearChatMessages(uid);
        set({ messages: [] });
      } catch (error) {
        console.error('Failed to clear conversation:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to clear conversation',
        });
        throw error;
      } finally {
        set({ isSending: false });
      }
    },
  };
});
