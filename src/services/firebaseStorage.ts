import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image data. Please try a different image.');
  }

  const mimeType = match[1]!;
  const byteString = atob(match[2]!);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }

  return { blob: new Blob([bytes], { type: mimeType }), mimeType };
}

async function toBlob(input: string | Blob): Promise<{ blob: Blob; mimeType: string }> {
  if (input instanceof Blob) {
    return { blob: input, mimeType: input.type || 'image/png' };
  }
  if (input.startsWith('blob:')) {
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob URL (status ${response.status}) — the object URL may have been revoked`);
    }
    const blob = await response.blob();
    return { blob, mimeType: blob.type || 'image/png' };
  }
  return dataUrlToBlob(input);
}

function mimeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/heic': 'heic',
    'image/tiff': 'tiff',
  };
  return map[mimeType] ?? 'png';
}

export async function uploadChatImage(
  uid: string,
  messageId: string,
  input: string | Blob
): Promise<{ downloadUrl: string; storagePath: string }> {
  try {
    const { blob, mimeType } = await toBlob(input);
    const ext = mimeToExtension(mimeType);
    const storagePath = `chat_images/${uid}/${messageId}.${ext}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob, { contentType: mimeType });
    const downloadUrl = await getDownloadURL(storageRef);

    return { downloadUrl, storagePath };
  } catch (error) {
    console.error('Failed to upload chat image:', error);
    const wrapped = new Error('Failed to upload image. Please try again.');
    (wrapped as unknown as Record<string, unknown>).cause = error;
    throw wrapped;
  }
}

export async function deleteChatImage(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    // Ignore not-found errors during cleanup
    console.warn('Failed to delete chat image:', storagePath, error);
  }
}
