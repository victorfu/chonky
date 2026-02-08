import { create } from 'zustand';
import type { ModelType } from '@/types';
import type { AnalysisMode, AnalysisResultType } from '@/types/screenshot';
import { ANALYSIS_MODES } from '@/types/screenshot';
import { analyzeScreenshot } from '@/services/screenshotAnalysis';
import { preloadBackgroundRemovalModel } from '@/services/image-processing/removeBackground';
import { useSettingsStore } from './useSettingsStore';

interface ScreenshotStore {
  currentImage: string | null;
  analysisResult: string;
  streamingResult: string;
  isAnalyzing: boolean;
  selectedMode: AnalysisMode;
  selectedModel: ModelType;
  error: string | null;
  resultType: AnalysisResultType;
  processedImageData: string | null;

  // Actions
  setImage: (base64: string) => void;
  clearImage: () => void;
  setMode: (mode: AnalysisMode) => void;
  setModel: (model: ModelType) => void;
  analyze: () => Promise<void>;
  clearResult: () => void;
}

// Helper to validate if a mode is still valid (handles legacy modes)
function isValidMode(mode: string): mode is AnalysisMode {
  return (ANALYSIS_MODES as readonly string[]).includes(mode);
}

function revokeIfObjectUrl(url: string | null): void {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

async function warmupBackgroundRemovalModel() {
  try {
    await preloadBackgroundRemovalModel();
  } catch {
    // Ignore preload failures; analyze() will surface user-facing errors.
  }
}

export const useScreenshotStore = create<ScreenshotStore>((set, get) => ({
  currentImage: null,
  analysisResult: '',
  streamingResult: '',
  isAnalyzing: false,
  selectedMode: 'explain',
  selectedModel: 'gemini-2.5-flash',
  error: null,
  resultType: 'text',
  processedImageData: null,

  setImage: (base64) => {
    const mode = get().selectedMode;
    revokeIfObjectUrl(get().processedImageData);
    set({
      currentImage: base64,
      analysisResult: '',
      streamingResult: '',
      error: null,
      resultType: 'text',
      processedImageData: null,
    });

    if (mode === 'remove-bg') {
      void warmupBackgroundRemovalModel();
    }
  },

  clearImage: () => {
    revokeIfObjectUrl(get().processedImageData);
    set({
      currentImage: null,
      analysisResult: '',
      streamingResult: '',
      error: null,
      resultType: 'text',
      processedImageData: null,
    });
  },

  setMode: (mode) => {
    // Validate mode is still valid (handles legacy modes like 'code' and 'error')
    if (isValidMode(mode)) {
      set({ selectedMode: mode });
      if (mode === 'remove-bg') {
        void warmupBackgroundRemovalModel();
      }
    } else {
      // Fallback to default mode for legacy/invalid modes
      set({ selectedMode: 'explain' });
    }
  },

  setModel: (model) => {
    set({ selectedModel: model });
  },

  analyze: async () => {
    const { currentImage, selectedMode, selectedModel } = get();
    const language = useSettingsStore.getState().settings.general.language;

    if (!currentImage) {
      set({ error: 'No image to analyze' });
      return;
    }

    revokeIfObjectUrl(get().processedImageData);
    set({
      isAnalyzing: true,
      analysisResult: '',
      streamingResult: '',
      error: null,
      resultType: 'text',
      processedImageData: null,
    });

    try {
      const dataUrlMatch = currentImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      const mimeType = dataUrlMatch?.[1] ?? 'image/png';
      const base64Data = dataUrlMatch?.[2] ?? currentImage;

      const result = await analyzeScreenshot(
        base64Data,
        selectedMode,
        selectedModel,
        language,
        (chunk) => {
          set({ streamingResult: chunk });
        },
        mimeType
      );

      revokeIfObjectUrl(get().processedImageData);
      set({
        analysisResult: result.text,
        streamingResult: '',
        resultType: result.resultType,
        processedImageData: result.processedImageData || null,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Analysis failed' });
    } finally {
      set({ isAnalyzing: false });
    }
  },

  clearResult: () => {
    revokeIfObjectUrl(get().processedImageData);
    set({
      analysisResult: '',
      streamingResult: '',
      error: null,
      resultType: 'text',
      processedImageData: null,
    });
  },
}));
