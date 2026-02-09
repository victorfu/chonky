/**
 * Convert an ArrayBuffer to a base64-encoded string.
 *
 * Uses chunked `String.fromCharCode` (32 KB per chunk) to avoid
 * blowing the call-stack on large buffers, then `btoa` for encoding.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}
