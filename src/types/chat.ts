import type { ModelType } from './settings';
import type { AnalysisResultType } from './screenshot';

export type ChatRole = 'user' | 'assistant';

export type ChatMessageStatus = 'pending' | 'sent' | 'error';

export interface ChatMessageAttachment {
  type: 'image';
  /** Firebase Storage download URL (persisted) or local object URL (before upload completes) */
  url: string;
  mimeType: string;
  /** Local-only image blob used for processing/upload before persistence. */
  localBlob?: Blob;
  /** Firebase Storage path for cleanup/deletion */
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
  attachment?: ChatMessageAttachment;
  resultType?: AnalysisResultType;
  processedImageData?: string;
}

export interface ChatThreadMeta {
  uid: string;
  title: string;
  schemaVersion: number;
  createdAt?: string;
  updatedAt?: string;
}
