import { create } from 'zustand';
import type { ChatMessage } from '@/types';
import {
  addChatMessage,
  clearChatMessages,
  ensureDefaultChat,
  subscribeChatMessages,
} from '@/services/firestoreChat';
import { generateAssistantReply } from '@/services/chatProvider';
import { useAuthStore } from './useAuthStore';
import { useSettingsStore } from './useSettingsStore';

const PENDING_CHAT_MESSAGE_KEY = 'pending-chat-message';
const AUTH_REQUIRED_ERROR_CODE = 'AUTH_REQUIRED';

let authStoreUnsubscribe: (() => void) | null = null;
let chatMessagesUnsubscribe: (() => void) | null = null;
let activeUid: string | null = null;

type AuthRequiredError = Error & { code: typeof AUTH_REQUIRED_ERROR_CODE };

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

function loadPendingMessage(): string | null {
  try {
    const message = sessionStorage.getItem(PENDING_CHAT_MESSAGE_KEY);
    return message?.trim() ?? null;
  } catch {
    return null;
  }
}

function savePendingMessage(message: string): void {
  try {
    sessionStorage.setItem(PENDING_CHAT_MESSAGE_KEY, message);
  } catch {
    // Ignore storage errors.
  }
}

function clearPendingMessage(): void {
  try {
    sessionStorage.removeItem(PENDING_CHAT_MESSAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

interface ChatStore {
  messages: ChatMessage[];
  draftInput: string;
  isInitializing: boolean;
  isSending: boolean;
  error: string | null;

  initialize: () => () => void;
  setDraftInput: (value: string) => void;
  sendMessage: (text: string) => Promise<void>;
  consumePendingMessageAndSend: () => Promise<void>;
  clearConversation: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  draftInput: '',
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

  sendMessage: async (text) => {
    const content = text.trim();
    if (!content) {
      return;
    }

    const uid = activeUid ?? useAuthStore.getState().user?.id ?? null;
    if (!uid) {
      savePendingMessage(content);
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
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
      throw error;
    } finally {
      set({ isSending: false });
    }
  },

  consumePendingMessageAndSend: async () => {
    const pendingMessage = loadPendingMessage();
    if (!pendingMessage) {
      return;
    }

    clearPendingMessage();

    try {
      await get().sendMessage(pendingMessage);
    } catch (error) {
      if (isAuthRequiredError(error)) {
        savePendingMessage(pendingMessage);
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
}));
