import { Lightbulb, Type, Languages, ImageMinus, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AnalysisMode } from '@/types/screenshot';
import { ANALYSIS_MODES } from '@/types/screenshot';
import { cn } from '@/utils/cn';

interface AnalysisModeSelectorProps {
  selectedMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
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

export function AnalysisModeSelector({ selectedMode, onModeChange }: AnalysisModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-base-content">
        {t('screenshot.analysisMode', 'Analysis Mode')}
      </label>
      <div className="flex flex-wrap gap-2">
        {ANALYSIS_MODES.map((mode) => {
          const Icon = modeIcons[mode];
          const isSelected = selectedMode === mode;

          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-base-300 hover:border-primary/50 hover:bg-base-200'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t(modeLabelKeys[mode], mode)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
