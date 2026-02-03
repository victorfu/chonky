import { Lightbulb, Type, Languages, ImageMinus, UserRound, Trash2, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AnalysisMode } from '@/types/screenshot';
import { ANALYSIS_MODES } from '@/types/screenshot';
import type { ModelType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { cn } from '@/utils/cn';

interface FloatingCommandBarProps {
  selectedMode: AnalysisMode;
  selectedModel: ModelType;
  isAnalyzing: boolean;
  isAuthenticated?: boolean;
  onSignIn?: () => void;
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
  'segment-person': UserRound,
};

const modeLabelKeys: Record<AnalysisMode, string> = {
  explain: 'screenshot.modes.explain',
  ocr: 'screenshot.modes.ocr',
  translate: 'screenshot.modes.translate',
  'remove-bg': 'screenshot.modes.removeBg',
  'segment-person': 'screenshot.modes.segmentPerson',
};

const modelOptions = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
];

export function FloatingCommandBar({
  selectedMode,
  selectedModel,
  isAnalyzing,
  isAuthenticated = true,
  onSignIn,
  onModeChange,
  onModelChange,
  onAnalyze,
  onClear,
}: FloatingCommandBarProps) {
  const { t } = useTranslation();
  const showAuthHint = !isAuthenticated;

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Model Select - full width on mobile */}
        <Select
          value={selectedModel}
          onChange={(value) => onModelChange(value as ModelType)}
          options={modelOptions}
          size="sm"
          inline
          className="w-full sm:w-48"
          disabled={isAnalyzing}
        />

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
              : showAuthHint
                ? t('screenshot.signInToAnalyze', 'Sign in to analyze')
                : t('screenshot.analyze', 'Analyze')}
          </Button>
        </div>
      </div>

      {showAuthHint && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/60">
          <span>{t('screenshot.loginRequired', 'Sign in required to run analysis')}</span>
          {onSignIn && (
            <Button variant="ghost" size="sm" onClick={onSignIn}>
              {t('screenshot.signInCta', 'Sign in')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
