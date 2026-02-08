import { getGenerativeModel } from 'firebase/ai';
import { ai } from './firebase';
import type { ModelType, Language } from '@/types';
import type { AnalysisMode, AnalysisResultType } from '@/types/screenshot';
import i18n from '@/i18n';
import { removeImageBackground } from './image-processing/removeBackground';

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

function isImagePipelineError(error: unknown): error is { code: unknown } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  );
}

async function analyzeImageMode(
  imageBase64: string,
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
      const result = await removeImageBackground(imageBase64, mimeType);

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
      throw new Error(mapImagePipelineErrorCode(error.code, language));
    }

    console.error('Image mode analysis error:', error);
    throw new Error(i18n.t('screenshot.errors.imagePipelineInferenceFailed', { lng: language }));
  }
}

/**
 * Analyze a screenshot using Gemini Vision (text modes) and local models (image modes).
 * @param imageBase64 - Base64 encoded image data (without data URL prefix)
 * @param mode - Analysis mode
 * @param model - Model to use for text modes
 * @param language - Target language for the analysis
 * @param onChunk - Callback for streaming chunks
 * @param mimeType - Original image mime type
 */
export async function analyzeScreenshot(
  imageBase64: string,
  mode: AnalysisMode,
  model: ModelType,
  language: Language = 'zh-TW',
  onChunk?: (fullText: string) => void,
  mimeType = 'image/png'
): Promise<ImageAnalysisResult> {
  if (isImageMode(mode)) {
    return analyzeImageMode(imageBase64, mode, mimeType, language);
  }

  try {
    const geminiModel = getGenerativeModel(ai, { model });

    // Get localized prompt using i18n
    const instruction = i18n.t('screenshot.prompts.instruction', { lng: language });
    const prompt = i18n.t(`screenshot.prompts.${mode}`, {
      lng: language,
      instruction,
    });

    const contentParts = [
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ];

    const result = await geminiModel.generateContentStream(contentParts);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk?.(fullText);
      }
    }

    return {
      text: fullText,
      resultType: 'text',
    };
  } catch (error) {
    console.error('Screenshot analysis error:', error);
    throw new Error(i18n.t('screenshot.errors.analysisFailed', { lng: language }));
  }
}
