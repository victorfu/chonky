import { getGenerativeModel } from 'firebase/ai';
import { ai } from './firebase';
import type { ModelType, Language } from '@/types';
import type { AnalysisMode, AnalysisResultType } from '@/types/screenshot';
import i18n from '@/i18n';

// Types for image processing
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface SubjectCoordinates {
  subject: string;
  bounds: BoundingBox;
  polygon: Point[];
}

export interface PersonCoordinates {
  id: number;
  bounds: BoundingBox;
  polygon: Point[];
}

export interface PersonSegmentationResult {
  people: PersonCoordinates[];
  count: number;
}

export interface ImageAnalysisResult {
  text: string;
  resultType: AnalysisResultType;
  processedImageData?: string;
  coordinates?: SubjectCoordinates | PersonSegmentationResult;
}

const IMAGE_MODES: AnalysisMode[] = ['remove-bg', 'segment-person'];

export function isImageMode(mode: AnalysisMode): boolean {
  return IMAGE_MODES.includes(mode);
}

/**
 * Parse Gemini's JSON coordinate output
 */
export function parseGeminiCoordinates(text: string): SubjectCoordinates | PersonSegmentationResult | null {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;

    const parsed = JSON.parse(jsonStr.trim());

    // Check if it's a person segmentation result
    if ('people' in parsed && Array.isArray(parsed.people)) {
      return parsed as PersonSegmentationResult;
    }

    // Check if it's a subject coordinate result
    if ('subject' in parsed && 'bounds' in parsed) {
      return parsed as SubjectCoordinates;
    }

    return null;
  } catch {
    console.error('Failed to parse Gemini coordinates:', text);
    return null;
  }
}

/**
 * Process image with mask using Canvas API
 */
export async function processImageWithMask(
  imageBase64: string,
  coordinates: SubjectCoordinates | PersonSegmentationResult
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Get polygons to draw
      let polygons: Point[][] = [];

      if ('people' in coordinates) {
        // Person segmentation - use all people's polygons
        polygons = coordinates.people.map(p => p.polygon);
      } else if ('polygon' in coordinates) {
        // Subject removal - use single polygon
        polygons = [coordinates.polygon];
      }

      if (polygons.length === 0 || polygons.every(p => p.length === 0)) {
        // No valid polygon, use bounding box
        const bounds = 'people' in coordinates
          ? coordinates.people[0]?.bounds
          : coordinates.bounds;

        if (bounds) {
          // Create rectangular polygon from bounds
          polygons = [[
            { x: bounds.x, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
            { x: bounds.x, y: bounds.y + bounds.height },
          ]];
        }
      }

      // Create clipping path from all polygons
      ctx.beginPath();
      for (const polygon of polygons) {
        if (polygon.length < 3) continue;

        const startX = (polygon[0].x / 100) * img.width;
        const startY = (polygon[0].y / 100) * img.height;
        ctx.moveTo(startX, startY);

        for (let i = 1; i < polygon.length; i++) {
          const x = (polygon[i].x / 100) * img.width;
          const y = (polygon[i].y / 100) * img.height;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
      }

      // Clip and draw
      ctx.clip();
      ctx.drawImage(img, 0, 0);

      // Export as PNG with transparency
      const result = canvas.toDataURL('image/png').split(',')[1];
      resolve(result);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = `data:image/png;base64,${imageBase64}`;
  });
}

/**
 * Analyze a screenshot using Gemini Vision
 * @param imageBase64 - Base64 encoded image data (without data URL prefix)
 * @param mode - Analysis mode
 * @param model - Model to use
 * @param language - Target language for the analysis
 * @param onChunk - Callback for streaming chunks
 * @returns Analysis result with text and optionally processed image
 */
export async function analyzeScreenshot(
  imageBase64: string,
  mode: AnalysisMode,
  model: ModelType,
  language: Language = 'zh-TW',
  onChunk?: (fullText: string) => void
): Promise<ImageAnalysisResult> {
  try {
    const geminiModel = getGenerativeModel(ai, { model });

    // Get localized prompt using i18n
    const instruction = i18n.t('screenshot.prompts.instruction', { lng: language });
    const prompt = i18n.t(`screenshot.prompts.${mode}`, {
      lng: language,
      instruction,
    });

    // Create content parts with image
    const contentParts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64,
        },
      },
    ];

    // Use streaming for better UX
    const result = await geminiModel.generateContentStream(contentParts);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk?.(fullText);
      }
    }

    // For image modes, process the result
    if (isImageMode(mode)) {
      const coordinates = parseGeminiCoordinates(fullText);

      if (coordinates) {
        // Check for no people detected
        if ('people' in coordinates && coordinates.count === 0) {
          return {
            text: fullText,
            resultType: 'image',
            coordinates,
          };
        }

        try {
          const processedImageData = await processImageWithMask(imageBase64, coordinates);
          return {
            text: fullText,
            resultType: 'image',
            processedImageData,
            coordinates,
          };
        } catch (processError) {
          console.error('Image processing error:', processError);
          return {
            text: fullText,
            resultType: 'image',
            coordinates,
          };
        }
      }

      // Failed to parse coordinates
      return {
        text: fullText,
        resultType: 'image',
      };
    }

    // Text mode result
    return {
      text: fullText,
      resultType: 'text',
    };
  } catch (error) {
    console.error('Screenshot analysis error:', error);
    throw new Error('Failed to analyze screenshot. Please try again.');
  }
}
