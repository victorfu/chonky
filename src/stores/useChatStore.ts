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
import { generateAssistantReply, streamImageReply } from '@/services/chatProvider';
import { analyzeScreenshot, isImageMode } from '@/services/screenshotAnalysis';
import { deleteChatImage, uploadChatImage } from '@/services/firebaseStorage';
import { useAuthStore } from './useAuthStore';
import { useSettingsStore } from './useSettingsStore';

const PENDING_CHAT_MESSAGE_KEY = 'pending-chat-message';
const AUTH_REQUIRED_ERROR_CODE = 'AUTH_REQUIRED';
const pendingChatStore = createStore('chonky-chat', 'pending');

type AuthRequiredError = Error & { code: typeof AUTH_REQUIRED_ERROR_CODE };
type PendingChatMessage =
  | { kind: 'text'; text: string }
  | {
      kind: 'image';
      text: string;
      attachment: ChatMessageAttachment;
      mode?: AnalysisMode;
    };

function isAnalysisMode(value: unknown): value is AnalysisMode {
  return value === 'explain' || value === 'ocr' || value === 'translate' || value === 'remove-bg';
}

function isChatMessageAttachment(value: unknown): value is ChatMessageAttachment {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value as Record<string, unknown>).type === 'image' &&
    'url' in value &&
    typeof (value as Record<string, unknown>).url === 'string' &&
    (value as Record<string, unknown>).url !== '' &&
    'mimeType' in value &&
    typeof (value as Record<string, unknown>).mimeType === 'string' &&
    (value as Record<string, unknown>).mimeType !== '' &&
    (!('storagePath' in value) ||
      (value as Record<string, unknown>).storagePath == null ||
      typeof (value as Record<string, unknown>).storagePath === 'string')
  );
}

function parsePendingMessage(raw: string): PendingChatMessage | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'kind' in parsed &&
      (parsed as Record<string, unknown>).kind === 'text' &&
      'text' in parsed &&
      typeof (parsed as Record<string, unknown>).text === 'string'
    ) {
      const text = ((parsed as Record<string, unknown>).text as string).trim();
      return text ? { kind: 'text', text } : null;
    }

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'kind' in parsed &&
      (parsed as Record<string, unknown>).kind === 'image' &&
      'text' in parsed &&
      typeof (parsed as Record<string, unknown>).text === 'string' &&
      'attachment' in parsed &&
      isChatMessageAttachment((parsed as Record<string, unknown>).attachment)
    ) {
      const modeValue = (parsed as Record<string, unknown>).mode;
      const mode = isAnalysisMode(modeValue) ? modeValue : undefined;
      return {
        kind: 'image',
        text: (parsed as Record<string, unknown>).text as string,
        attachment: (parsed as Record<string, unknown>).attachment as ChatMessageAttachment,
        mode,
      };
    }
  } catch {
    // Backward compatibility for previous plain-string pending payloads.
  }

  return { kind: 'text', text: trimmed };
}

function normalizePendingMessage(value: unknown): PendingChatMessage | null {
  if (typeof value === 'string') {
    return parsePendingMessage(value);
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    (value as Record<string, unknown>).kind === 'text' &&
    'text' in value &&
    typeof (value as Record<string, unknown>).text === 'string'
  ) {
    const text = ((value as Record<string, unknown>).text as string).trim();
    return text ? { kind: 'text', text } : null;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    (value as Record<string, unknown>).kind === 'image' &&
    'text' in value &&
    typeof (value as Record<string, unknown>).text === 'string' &&
    'attachment' in value &&
    isChatMessageAttachment((value as Record<string, unknown>).attachment)
  ) {
    const modeValue = (value as Record<string, unknown>).mode;
    const mode = isAnalysisMode(modeValue) ? modeValue : undefined;
    return {
      kind: 'image',
      text: (value as Record<string, unknown>).text as string,
      attachment: (value as Record<string, unknown>).attachment as ChatMessageAttachment,
      mode,
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

async function savePendingImageMessage(
  text: string,
  attachment: ChatMessageAttachment,
  mode?: AnalysisMode
): Promise<void> {
  await savePendingMessage({
    kind: 'image',
    text,
    attachment,
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
  if (error && typeof error === 'object' && 'code' in error && typeof (error as Record<string, unknown>).code === 'string') {
    return error as { code: string };
  }
  if (error instanceof Error && 'cause' in error) {
    return findErrorWithCode((error as unknown as Record<string, unknown>).cause);
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
      let assistantTempId: string | null = null;
      const uploadedStoragePaths = new Set<string>();
      const persistedStoragePaths = new Set<string>();
      let processedResultObjectUrl: string | null = null;

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
        // Upload image to Firebase Storage
        const { downloadUrl, storagePath } = await uploadChatImage(uid, userTempId, attachment.url);
        uploadedStoragePaths.add(storagePath);
        const persistedAttachment: ChatMessageAttachment = {
          type: 'image',
          url: downloadUrl,
          mimeType: attachment.mimeType,
          storagePath,
        };

        // Update local message with storage URL
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === userTempId ? { ...m, attachment: persistedAttachment } : m
          ),
        }));

        // Persist user message to Firestore
        const persistedUserMessageId = await addChatMessage(uid, {
          role: 'user',
          content,
          status: 'sent',
          model: defaultModel,
          createdAtMs: nowMs,
          attachment: persistedAttachment,
        });
        persistedStoragePaths.add(storagePath);

        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === userTempId
              ? { ...m, id: persistedUserMessageId, status: 'sent' }
              : m
          ),
        }));

        // Handle remove-bg locally
        if (mode && isImageMode(mode)) {
          const dataUrlMatch = attachment.url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
          const mimeType = dataUrlMatch?.[1] ?? attachment.mimeType;
          const base64Data = dataUrlMatch?.[2] ?? attachment.url;

          const result = await analyzeScreenshot(base64Data, mode, defaultModel, language, undefined, mimeType);

          const assistantMs = Date.now();
          const nextAssistantTempId = `local-assistant-${assistantMs}`;
          assistantTempId = nextAssistantTempId;

          // Upload processed image to Storage if it's an image result
          let processedImageUrl = result.processedImageData;
          let processedStoragePath: string | undefined;
          if (result.resultType === 'image' && result.processedImageData) {
            if (result.processedImageData.startsWith('blob:')) {
              processedResultObjectUrl = result.processedImageData;
            }
            const processedUpload = await uploadChatImage(uid, nextAssistantTempId, result.processedImageData);
            processedImageUrl = processedUpload.downloadUrl;
            processedStoragePath = processedUpload.storagePath;
            uploadedStoragePaths.add(processedStoragePath);
          }

          const processedAttachment: ChatMessageAttachment | undefined =
            result.resultType === 'image' && processedImageUrl
              ? {
                  type: 'image',
                  url: processedImageUrl,
                  mimeType: 'image/png',
                  storagePath: processedStoragePath,
                }
              : undefined;

          set((state) => ({
            streamingContent: '',
            messages: [
              ...state.messages,
              {
                id: nextAssistantTempId,
                role: 'assistant',
                content: result.text,
                status: 'pending',
                createdAt: new Date(assistantMs).toISOString(),
                createdAtMs: assistantMs,
                model: defaultModel,
                resultType: result.resultType,
                processedImageData: processedImageUrl ?? undefined,
                attachment: processedAttachment,
              },
            ],
          }));

          const persistedAssistantId = await addChatMessage(uid, {
            role: 'assistant',
            content: result.text,
            status: 'sent',
            model: defaultModel,
            createdAtMs: assistantMs,
            resultType: result.resultType,
            processedImageData: processedImageUrl ?? undefined,
            attachment: processedAttachment,
          });
          if (processedStoragePath) {
            persistedStoragePaths.add(processedStoragePath);
          }

          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === nextAssistantTempId
                ? { ...m, id: persistedAssistantId, status: 'sent' }
                : m
            ),
          }));

          return;
        }

        // Streaming text analysis for text modes / custom prompt
        const dataUrlMatch = attachment.url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        const mimeType = dataUrlMatch?.[1] ?? attachment.mimeType;
        const base64Data = dataUrlMatch?.[2] ?? attachment.url;

        const assistantMs = Date.now();
        const nextAssistantTempId = `local-assistant-${assistantMs}`;
        assistantTempId = nextAssistantTempId;

        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: nextAssistantTempId,
              role: 'assistant',
              content: '',
              status: 'pending',
              createdAt: new Date(assistantMs).toISOString(),
              createdAtMs: assistantMs,
              model: defaultModel,
            },
          ],
        }));

        const fullText = await streamImageReply(
          base64Data,
          mimeType,
          { language, model: defaultModel },
          (chunk) => {
            set({ streamingContent: chunk });
          },
          text.trim() || undefined,
          mode
        );

        set({ streamingContent: '' });

        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === nextAssistantTempId ? { ...m, content: fullText } : m
          ),
        }));

        const persistedAssistantId = await addChatMessage(uid, {
          role: 'assistant',
          content: fullText,
          status: 'sent',
          model: defaultModel,
          createdAtMs: assistantMs,
        });

        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === nextAssistantTempId
              ? { ...m, id: persistedAssistantId, status: 'sent' }
              : m
          ),
        }));
      } catch (error) {
        const cleanupPaths = Array.from(uploadedStoragePaths).filter(
          (path) => !persistedStoragePaths.has(path)
        );
        if (cleanupPaths.length > 0) {
          await Promise.all(cleanupPaths.map((path) => deleteChatImage(path)));
        }

        console.error('Failed to send image message:', error);
        set((state) => ({
          streamingContent: '',
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
        if (processedResultObjectUrl && typeof URL !== 'undefined') {
          URL.revokeObjectURL(processedResultObjectUrl);
        }
        set({ isSending: false });
      }
    },

    consumePendingMessageAndSend: async () => {
      const pendingMessage = await loadPendingMessage();
      if (!pendingMessage) {
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
        await savePendingMessage(pendingMessage);
        if (!isAuthRequiredError(error)) {
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
