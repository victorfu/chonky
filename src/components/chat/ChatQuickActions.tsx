import { Lightbulb, Type, Languages, ImageMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AnalysisMode } from '@/types/screenshot';
import { ANALYSIS_MODES } from '@/types/screenshot';
import { cn } from '@/utils/cn';

interface ChatQuickActionsProps {
  onQuickAction: (mode: AnalysisMode) => void;
  disabled?: boolean;
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

export function ChatQuickActions({ onQuickAction, disabled }: ChatQuickActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2 px-1">
      {ANALYSIS_MODES.map((mode) => {
        const Icon = modeIcons[mode];
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onQuickAction(mode)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              'bg-base-200 hover:bg-primary hover:text-primary-content',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{t(modeLabelKeys[mode], mode)}</span>
          </button>
        );
      })}
    </div>
  );
}
