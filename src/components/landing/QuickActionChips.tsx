import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, FileText, TrendingUp, Code } from 'lucide-react';

interface QuickAction {
  labelKey: string;
  icon: ReactNode;
}

const quickActions: QuickAction[] = [
  { labelKey: 'landing.chips.latestTechNews', icon: <Calendar className="h-4 w-4" /> },
  { labelKey: 'landing.chips.summarizePdf', icon: <FileText className="h-4 w-4" /> },
  { labelKey: 'landing.chips.analyzeMarket', icon: <TrendingUp className="h-4 w-4" /> },
  { labelKey: 'landing.chips.helpMeCode', icon: <Code className="h-4 w-4" /> },
];

interface QuickActionChipsProps {
  onSelect: (query: string) => void;
}

export function QuickActionChips({ onSelect }: QuickActionChipsProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2 px-4">
      {quickActions.map((action) => {
        const label = t(action.labelKey);
        return (
          <button
            key={action.labelKey}
            type="button"
            onClick={() => onSelect(label)}
            className="inline-flex items-center gap-2 rounded-full border border-border-hairline bg-background-elevated/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all motion-safe:duration-200 hover:border-accent/30 hover:bg-accent/8 active:scale-[0.98]"
          >
            <span className="text-muted-foreground">{action.icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
