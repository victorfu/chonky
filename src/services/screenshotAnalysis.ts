import type { Language } from '@/types';
import type { AnalysisMode, AnalysisResultType } from '@/types/screenshot';
import i18n from '@/i18n';

interface Size {
  width: number;
  height: number;
}

export interface ImageProcessingMeta {
  pipeline: 'remove-bg-local';
  inferenceSize: Size;
  durationMs: number;
}

export interface ImageAnalysisResult {
  text: string;
  resultType: AnalysisResultType;
  processedImageData?: string;
  processingMeta?: ImageProcessingMeta;
}

const IMAGE_MODES: AnalysisMode[] = ['remove-bg'];
const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

export function isImageMode(mode: AnalysisMode): boolean {
  return IMAGE_MODES.includes(mode);
}

function mapImagePipelineErrorCode(code: unknown, language: Language): string {
  switch (code) {
    case 'IMAGE_MODEL_LOAD_FAILED':
      return i18n.t('screenshot.errors.imagePipelineLoadFailed', { lng: language });
    case 'BACKGROUND_REMOVAL_FAILED':
      return i18n.t('screenshot.errors.backgroundRemovalFailed', { lng: language });
    default:
      return i18n.t('screenshot.errors.imagePipelineInferenceFailed', { lng: language });
  }
}

const IMAGE_PIPELINE_ERROR_CODES = new Set([
  'IMAGE_MODEL_LOAD_FAILED',
  'BACKGROUND_REMOVAL_FAILED',
]);

function isImagePipelineError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string' &&
    IMAGE_PIPELINE_ERROR_CODES.has((error as Record<string, unknown>).code as string)
  );
}

async function fetchBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image blob (status ${response.status})`);
  }
  return response.blob();
}

async function resolveImageBlob(imageInput: string | Blob, fallbackMimeType: string): Promise<Blob> {
  if (imageInput instanceof Blob) {
    return imageInput;
  }

  const dataUrlMatch = imageInput.match(DATA_URL_PATTERN);
  if (dataUrlMatch) {
    return fetchBlob(imageInput);
  }

  if (
    imageInput.startsWith('blob:') ||
    imageInput.startsWith('http://') ||
    imageInput.startsWith('https://')
  ) {
    return fetchBlob(imageInput);
  }

  const response = await fetch(`data:${fallbackMimeType};base64,${imageInput}`);
  if (!response.ok) {
    throw new Error(`Failed to decode base64 image (status ${response.status})`);
  }

  return response.blob();
}

async function analyzeImageMode(
  imageInput: string | Blob,
  mode: AnalysisMode,
  mimeType: string,
  language: Language
): Promise<ImageAnalysisResult> {
  // Let the loading state paint before entering heavier image processing work.
  await new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 0);
  });

  try {
    if (mode === 'remove-bg') {
      const imageBlob = await resolveImageBlob(imageInput, mimeType);
      const { removeImageBackground } = await import('./image-processing/removeBackground');
      const result = await removeImageBackground(imageBlob, imageBlob.type || mimeType);

      return {
        text: '',
        resultType: 'image',
        processedImageData: result.processedImageData,
        processingMeta: {
          pipeline: 'remove-bg-local',
          inferenceSize: result.inferenceSize,
          durationMs: result.durationMs,
        },
      };
    }

    throw new Error(`Unsupported image mode: ${mode}`);
  } catch (error) {
    if (isImagePipelineError(error)) {
      const wrapped = new Error(mapImagePipelineErrorCode(error.code, language));
      (wrapped as unknown as Record<string, unknown>).cause = error;
      throw wrapped;
    }

    console.error('Image mode analysis error:', error);
    const wrapped = new Error(i18n.t('screenshot.errors.imagePipelineInferenceFailed', { lng: language }));
    (wrapped as unknown as Record<string, unknown>).cause = error;
    throw wrapped;
  }
}

/**
 * Analyze a screenshot using local image processing models.
 * @param imageInput - Base64 string, data URL, object URL, or Blob image source
 * @param mode - Analysis mode (must be an image mode, e.g. 'remove-bg')
 * @param language - Target language for error messages
 * @param mimeType - Fallback image mime type
 */
export async function analyzeScreenshot(
  imageInput: string | Blob,
  mode: AnalysisMode,
  language: Language = 'zh-TW',
  mimeType = 'image/png'
): Promise<ImageAnalysisResult> {
  if (isImageMode(mode)) {
    return analyzeImageMode(imageInput, mode, mimeType, language);
  }

  throw new Error(`Unsupported analysis mode: ${mode}`);
}
