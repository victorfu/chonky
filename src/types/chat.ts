import type { ModelType } from './settings';

export type ChatRole = 'user' | 'assistant';

export type ChatMessageStatus = 'pending' | 'sent' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status: ChatMessageStatus;
  createdAt: string;
  createdAtMs: number;
  model?: ModelType;
}

export interface ChatThreadMeta {
  uid: string;
  title: string;
  schemaVersion: number;
  createdAt?: string;
  updatedAt?: string;
}
