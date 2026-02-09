import type { ChatMessage, ChatMessageAttachment, Language, ModelType } from '@/types';
import type { AnalysisMode } from '@/types/screenshot';
import { arrayBufferToBase64 } from '@/utils';
import { addChatMessage } from './firestoreChat';
import { uploadChatImage } from './firebaseStorage';
import { streamImageReply } from './chatProvider';

const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

// ---------------------------------------------------------------------------
// Image data helpers (moved from useChatStore)
// ---------------------------------------------------------------------------

async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch attachment image (status ${response.status})`);
  }
  return response.blob();
}

export async function attachmentToBlob(attachment: ChatMessageAttachment): Promise<Blob> {
  if (attachment.localBlob instanceof Blob) {
    return attachment.localBlob;
  }

  if (
    attachment.url.startsWith('data:') ||
    attachment.url.startsWith('blob:') ||
    attachment.url.startsWith('http://') ||
    attachment.url.startsWith('https://')
  ) {
    return fetchImageBlob(attachment.url);
  }

  const response = await fetch(`data:${attachment.mimeType};base64,${attachment.url}`);
  if (!response.ok) {
    throw new Error(`Failed to decode attachment base64 (status ${response.status})`);
  }
  return response.blob();
}

export async function attachmentToInlineData(
  attachment: ChatMessageAttachment
): Promise<{ mimeType: string; base64Data: string }> {
  if (attachment.localBlob instanceof Blob) {
    return {
      mimeType: attachment.localBlob.type || attachment.mimeType,
      base64Data: arrayBufferToBase64(await attachment.localBlob.arrayBuffer()),
    };
  }

  const dataUrlMatch = attachment.url.match(DATA_URL_PATTERN);
  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1],
      base64Data: dataUrlMatch[2],
    };
  }

  if (
    attachment.url.startsWith('blob:') ||
    attachment.url.startsWith('http://') ||
    attachment.url.startsWith('https://')
  ) {
    const blob = await fetchImageBlob(attachment.url);
    return {
      mimeType: blob.type || attachment.mimeType,
      base64Data: arrayBufferToBase64(await blob.arrayBuffer()),
    };
  }

  // Fallback: treat url as raw base64 string (legacy attachments before blob-based flow)
  console.warn('[chatImagePipeline] attachmentToInlineData: unrecognized URL format, treating as raw base64');
  return {
    mimeType: attachment.mimeType,
    base64Data: attachment.url,
  };
}

// ---------------------------------------------------------------------------
// Pipeline types
// ---------------------------------------------------------------------------

export interface ImagePipelineCallbacks {
  onAttachmentUploaded: (userTempId: string, attachment: ChatMessageAttachment) => void;
  onUserMessagePersisted: (tempId: string, persistedId: string) => void;
  onAssistantMessageCreated: (message: ChatMessage) => void;
  onAssistantContentUpdated: (tempId: string, content: string) => void;
  onAssistantMessagePersisted: (tempId: string, persistedId: string) => void;
  onStreamingChunk: (chunk: string) => void;
  onStreamingDone: () => void;
}

export interface ImagePipelineTracker {
  uploadedStoragePaths: Set<string>;
  persistedStoragePaths: Set<string>;
  processedResultObjectUrl: string | null;
  assistantTempId: string | null;
}

export function createPipelineTracker(): ImagePipelineTracker {
  return {
    uploadedStoragePaths: new Set(),
    persistedStoragePaths: new Set(),
    processedResultObjectUrl: null,
    assistantTempId: null,
  };
}

interface ImagePipelineInput {
  uid: string;
  content: string;
  attachment: ChatMessageAttachment;
  mode: AnalysisMode | undefined;
  userTempId: string;
  nowMs: number;
  defaultModel: ModelType;
  language: Language;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

export async function processImageMessage(
  input: ImagePipelineInput,
  callbacks: ImagePipelineCallbacks,
  tracker: ImagePipelineTracker
): Promise<void> {
  const {
    uid, content, attachment, mode,
    userTempId, nowMs, defaultModel, language,
  } = input;

  // 1. Upload image to Firebase Storage
  const { downloadUrl, storagePath } = await uploadChatImage(
    uid,
    userTempId,
    attachment.localBlob ?? attachment.url
  );
  tracker.uploadedStoragePaths.add(storagePath);

  const persistedAttachment: ChatMessageAttachment = {
    type: 'image',
    url: downloadUrl,
    mimeType: attachment.mimeType,
    storagePath,
  };

  callbacks.onAttachmentUploaded(userTempId, persistedAttachment);

  // 2. Persist user message to Firestore
  const persistedUserMessageId = await addChatMessage(uid, {
    role: 'user',
    content,
    status: 'sent',
    model: defaultModel,
    createdAtMs: nowMs,
    attachment: persistedAttachment,
  });
  tracker.persistedStoragePaths.add(storagePath);

  callbacks.onUserMessagePersisted(userTempId, persistedUserMessageId);

  // 3. Process the image depending on mode
  if (mode === 'remove-bg') {
    const result = await processRemoveBg(
      uid, attachment, defaultModel, language, callbacks,
      tracker
    );
    tracker.assistantTempId = result.assistantTempId;
    tracker.processedResultObjectUrl = result.processedResultObjectUrl;
  } else {
    // Streaming text analysis for text modes / custom prompt
    const result = await processStreamingTextAnalysis(
      uid, content, attachment, mode, defaultModel, language, callbacks,
    );
    tracker.assistantTempId = result.assistantTempId;
  }
}

// ---------------------------------------------------------------------------
// Remove-bg sub-pipeline
// ---------------------------------------------------------------------------

async function processRemoveBg(
  uid: string,
  attachment: ChatMessageAttachment,
  defaultModel: ModelType,
  language: Language,
  callbacks: ImagePipelineCallbacks,
  tracker: ImagePipelineTracker,
): Promise<{ assistantTempId: string; processedResultObjectUrl: string | null }> {
  const sourceBlob = await attachmentToBlob(attachment);
  const { analyzeScreenshot } = await import('./screenshotAnalysis');
  const result = await analyzeScreenshot(
    sourceBlob,
    'remove-bg',
    language,
    sourceBlob.type || attachment.mimeType
  );

  const assistantMs = Date.now();
  const nextAssistantTempId = `local-assistant-${assistantMs}`;
  let processedResultObjectUrl: string | null = null;

  // Upload processed image to Storage if it's an image result
  let processedImageUrl = result.processedImageData;
  let processedStoragePath: string | undefined;
  if (result.resultType === 'image' && result.processedImageData) {
    if (result.processedImageData.startsWith('blob:')) {
      processedResultObjectUrl = result.processedImageData;
      tracker.processedResultObjectUrl = result.processedImageData;
    }
    const processedUpload = await uploadChatImage(uid, nextAssistantTempId, result.processedImageData);
    processedImageUrl = processedUpload.downloadUrl;
    processedStoragePath = processedUpload.storagePath;
    tracker.uploadedStoragePaths.add(processedStoragePath);
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

  callbacks.onAssistantMessageCreated({
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
  });

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
    tracker.persistedStoragePaths.add(processedStoragePath);
  }

  callbacks.onAssistantMessagePersisted(nextAssistantTempId, persistedAssistantId);

  return { assistantTempId: nextAssistantTempId, processedResultObjectUrl };
}

// ---------------------------------------------------------------------------
// Streaming text analysis sub-pipeline
// ---------------------------------------------------------------------------

async function processStreamingTextAnalysis(
  uid: string,
  content: string,
  attachment: ChatMessageAttachment,
  mode: AnalysisMode | undefined,
  defaultModel: ModelType,
  language: Language,
  callbacks: ImagePipelineCallbacks,
): Promise<{ assistantTempId: string }> {
  const { mimeType, base64Data } = await attachmentToInlineData(attachment);

  const assistantMs = Date.now();
  const nextAssistantTempId = `local-assistant-${assistantMs}`;

  callbacks.onAssistantMessageCreated({
    id: nextAssistantTempId,
    role: 'assistant',
    content: '',
    status: 'pending',
    createdAt: new Date(assistantMs).toISOString(),
    createdAtMs: assistantMs,
    model: defaultModel,
  });

  const fullText = await streamImageReply(
    base64Data,
    mimeType,
    { language, model: defaultModel },
    (chunk) => {
      callbacks.onStreamingChunk(chunk);
    },
    content.trim() || undefined,
    mode
  );

  callbacks.onStreamingDone();
  callbacks.onAssistantContentUpdated(nextAssistantTempId, fullText);

  const persistedAssistantId = await addChatMessage(uid, {
    role: 'assistant',
    content: fullText,
    status: 'sent',
    model: defaultModel,
    createdAtMs: assistantMs,
  });

  callbacks.onAssistantMessagePersisted(nextAssistantTempId, persistedAssistantId);

  return { assistantTempId: nextAssistantTempId };
}
