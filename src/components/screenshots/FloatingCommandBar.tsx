import { Lightbulb, Type, Languages, ImageMinus, Trash2, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AnalysisMode } from '@/types/screenshot';
import { ANALYSIS_MODES } from '@/types/screenshot';
import { SUPPORTED_MODELS, MODEL_LABELS, type ModelType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { cn } from '@/utils/cn';

interface FloatingCommandBarProps {
  selectedMode: AnalysisMode;
  selectedModel: ModelType;
  isAnalyzing: boolean;
  onModeChange: (mode: AnalysisMode) => void;
  onModelChange: (model: ModelType) => void;
  onAnalyze: () => void;
  onClear: () => void;
}

const modeIcons: Record<AnalysisMode, React.ComponentType<{ className?: string }>> = {
  explain: Lightbulb,
  ocr: Type,
  translate: Languages,
  'remove-bg': ImageMinus,
};

const modeLabelKeys: Record<AnalysisMode, string> = {
  explain: 'screenshot.modes.explain',
  ocr: 'screenshot.modes.ocr',
  translate: 'screenshot.modes.translate',
  'remove-bg': 'screenshot.modes.removeBg',
};

const modelOptions = SUPPORTED_MODELS.map((model) => ({
  value: model,
  label: MODEL_LABELS[model],
}));

export function FloatingCommandBar({
  selectedMode,
  selectedModel,
  isAnalyzing,
  onModeChange,
  onModelChange,
  onAnalyze,
  onClear,
}: FloatingCommandBarProps) {
  const { t } = useTranslation();
  const isImageMode = selectedMode === 'remove-bg';

  return (
    <div
      className={cn(
        'bg-base-100 border border-base-300 shadow-card',
        'rounded-xl p-4',
        'animate-fade-in'
      )}
    >
      {/* Mode Pills Row */}
      <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
        {ANALYSIS_MODES.map((mode) => {
          const Icon = modeIcons[mode];
          const isSelected = selectedMode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => onModeChange(mode)}
              disabled={isAnalyzing}
              title={t(modeLabelKeys[mode], mode)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-full font-medium transition-all whitespace-nowrap',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                // Mobile: icon only, smaller
                'p-2.5 text-sm',
                // Desktop: icon + text, larger
                'sm:px-4 sm:py-2',
                isSelected
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'bg-base-200 hover:bg-base-300 text-base-content'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t(modeLabelKeys[mode], mode)}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-base-300 my-3" />

      {/* Actions - Mobile: stacked, Desktop: row */}
      <div
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4',
          isImageMode ? 'sm:justify-end' : 'sm:justify-between'
        )}
      >
        {/* Model Select - hide for image processing modes */}
        {!isImageMode && (
          <Select
            value={selectedModel}
            onChange={(value) => onModelChange(value as ModelType)}
            options={modelOptions}
            size="sm"
            inline
            className="w-full sm:w-48"
            disabled={isAnalyzing}
          />
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={onClear}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-none text-base-content/70 hover:text-error"
          >
            {t('screenshot.clear', 'Clear')}
          </Button>

          <Button
            variant="primary"
            leftIcon={<Zap className="w-4 h-4" />}
            onClick={onAnalyze}
            loading={isAnalyzing}
            className="flex-1 sm:flex-none"
          >
            {isAnalyzing
              ? t('screenshot.analyzing', 'Analyzing...')
              : t('screenshot.analyze', 'Analyze')}
          </Button>
        </div>
      </div>
    </div>
  );
}
