import type { ModelType } from './settings';

export type AnalysisMode =
  | 'explain'        // 通用解釋
  | 'ocr'            // 文字提取
  | 'translate'      // 翻譯
  | 'remove-bg'      // 去背景
  | 'segment-person'; // 人物切割

export const ANALYSIS_MODES: readonly AnalysisMode[] = [
  'explain',
  'ocr',
  'translate',
  'remove-bg',
  'segment-person',
] as const;

export interface AnalysisModeConfig {
  id: AnalysisMode;
  icon: string;
  labelKey: string;
  descriptionKey: string;
}

export const ANALYSIS_MODE_CONFIGS: Record<AnalysisMode, AnalysisModeConfig> = {
  explain: {
    id: 'explain',
    icon: 'lightbulb',
    labelKey: 'screenshot.modes.explain',
    descriptionKey: 'screenshot.modes.explainDesc',
  },
  ocr: {
    id: 'ocr',
    icon: 'text',
    labelKey: 'screenshot.modes.ocr',
    descriptionKey: 'screenshot.modes.ocrDesc',
  },
  translate: {
    id: 'translate',
    icon: 'languages',
    labelKey: 'screenshot.modes.translate',
    descriptionKey: 'screenshot.modes.translateDesc',
  },
  'remove-bg': {
    id: 'remove-bg',
    icon: 'image-minus',
    labelKey: 'screenshot.modes.removeBg',
    descriptionKey: 'screenshot.modes.removeBgDesc',
  },
  'segment-person': {
    id: 'segment-person',
    icon: 'user-round',
    labelKey: 'screenshot.modes.segmentPerson',
    descriptionKey: 'screenshot.modes.segmentPersonDesc',
  },
};

export type AnalysisResultType = 'text' | 'image';

export interface ScreenshotAnalysis {
  id: string;
  imageData: string;  // base64
  mode: AnalysisMode;
  result: string;
  resultType: AnalysisResultType;
  processedImageData?: string;  // base64, for image result types
  model: ModelType;
  createdAt: string;
}
