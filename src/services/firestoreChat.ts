import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  ChatMessage,
  ChatMessageStatus,
  ChatRole,
  ChatThreadMeta,
  ModelType,
} from '@/types';
import { db } from './firebase';

const USER_CHATS_COLLECTION = 'user_chats';
const CHAT_MESSAGES_SUBCOLLECTION = 'messages';
const CHAT_SCHEMA_VERSION = 1;
const DEFAULT_CHAT_TITLE = 'default';
const CHAT_MESSAGES_QUERY_LIMIT = 200;
const CHAT_CLEAR_BATCH_LIMIT = 500;

interface FirestoreChatThread {
  schemaVersion?: unknown;
  title?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface FirestoreChatMessage {
  role?: unknown;
  content?: unknown;
  status?: unknown;
  createdAt?: unknown;
  createdAtMs?: unknown;
  model?: unknown;
}

export interface AddChatMessageInput {
  role: ChatRole;
  content: string;
  status: ChatMessageStatus;
  model?: ModelType;
  createdAtMs?: number;
}

function getChatRef(uid: string) {
  return doc(db, USER_CHATS_COLLECTION, uid);
}

function getMessagesRef(uid: string) {
  return collection(getChatRef(uid), CHAT_MESSAGES_SUBCOLLECTION);
}

function toTimestampMs(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

function toIsoString(value: unknown, fallbackMs: number): string {
  const ms = toTimestampMs(value);
  return new Date(ms ?? fallbackMs).toISOString();
}

function isValidRole(value: unknown): value is ChatRole {
  return value === 'user' || value === 'assistant';
}

function isValidStatus(value: unknown): value is ChatMessageStatus {
  return value === 'pending' || value === 'sent' || value === 'error';
}

function normalizeThread(uid: string, raw: FirestoreChatThread | null | undefined): ChatThreadMeta {
  return {
    uid,
    schemaVersion:
      typeof raw?.schemaVersion === 'number' ? raw.schemaVersion : CHAT_SCHEMA_VERSION,
    title: typeof raw?.title === 'string' ? raw.title : DEFAULT_CHAT_TITLE,
    createdAt: toIsoString(raw?.createdAt, Date.now()),
    updatedAt: toIsoString(raw?.updatedAt, Date.now()),
  };
}

function normalizeMessage(
  id: string,
  raw: FirestoreChatMessage | null | undefined,
  fallbackMs: number
): ChatMessage {
  const createdAtMs = toTimestampMs(raw?.createdAtMs) ?? toTimestampMs(raw?.createdAt) ?? fallbackMs;

  return {
    id,
    role: isValidRole(raw?.role) ? raw.role : 'assistant',
    content: typeof raw?.content === 'string' ? raw.content : '',
    status: isValidStatus(raw?.status) ? raw.status : 'sent',
    createdAt: toIsoString(raw?.createdAt, createdAtMs),
    createdAtMs,
    model: typeof raw?.model === 'string' ? (raw.model as ModelType) : undefined,
  };
}

export async function ensureDefaultChat(uid: string): Promise<ChatThreadMeta> {
  const ref = getChatRef(uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    await setDoc(
      ref,
      {
        schemaVersion: CHAT_SCHEMA_VERSION,
        title: DEFAULT_CHAT_TITLE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: false }
    );

    return {
      uid,
      schemaVersion: CHAT_SCHEMA_VERSION,
      title: DEFAULT_CHAT_TITLE,
    };
  }

  return normalizeThread(uid, snapshot.data() as FirestoreChatThread);
}

export function subscribeChatMessages(
  uid: string,
  onData: (messages: ChatMessage[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const messagesQuery = query(
    getMessagesRef(uid),
    orderBy('createdAtMs', 'asc'),
    limitToLast(CHAT_MESSAGES_QUERY_LIMIT)
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const fallbackMs = Date.now();
      const messages = snapshot.docs.map((docSnapshot) =>
        normalizeMessage(
          docSnapshot.id,
          docSnapshot.data() as FirestoreChatMessage,
          fallbackMs
        )
      );
      onData(messages);
    },
    onError
  );
}

export async function addChatMessage(
  uid: string,
  message: AddChatMessageInput
): Promise<string> {
  const messageRef = doc(getMessagesRef(uid));
  const createdAtMs = message.createdAtMs ?? Date.now();

  const data: Record<string, unknown> = {
    role: message.role,
    content: message.content,
    status: message.status,
    model: message.model ?? null,
    createdAt: serverTimestamp(),
    createdAtMs,
  };

  const batch = writeBatch(db);

  batch.set(messageRef, data, { merge: true });

  batch.set(
    getChatRef(uid),
    {
      schemaVersion: CHAT_SCHEMA_VERSION,
      title: DEFAULT_CHAT_TITLE,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();

  return messageRef.id;
}

export async function clearChatMessages(uid: string): Promise<void> {
  const messagesRef = getMessagesRef(uid);

  while (true) {
    const snapshot = await getDocs(query(messagesRef, limit(CHAT_CLEAR_BATCH_LIMIT)));
    if (snapshot.empty) {
      break;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((messageDoc) => {
      batch.delete(messageDoc.ref);
    });
    await batch.commit();
  }

  await setDoc(
    getChatRef(uid),
    {
      schemaVersion: CHAT_SCHEMA_VERSION,
      title: DEFAULT_CHAT_TITLE,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
