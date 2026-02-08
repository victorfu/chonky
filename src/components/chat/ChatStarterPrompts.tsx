import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

interface ChatStarterPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ChatStarterPrompts({
  onSelect,
  disabled = false,
}: ChatStarterPromptsProps) {
  const { t } = useTranslation();
  const prompts = [
    t('chatHome.starters.prompt1', 'Help me summarize this task into actionable steps.'),
    t('chatHome.starters.prompt2', 'Draft a concise plan for this feature rollout.'),
    t('chatHome.starters.prompt3', 'Review this idea and list implementation risks.'),
    t('chatHome.starters.prompt4', 'Propose a clean architecture for this module.'),
  ];

  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-base-content/70">
        <Sparkles className="h-4 w-4" />
        {t('chatHome.starters.title', 'Try a starter prompt')}
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            disabled={disabled}
            className={cn(
              'rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-sm transition-colors',
              'hover:border-primary/50 hover:bg-primary/5',
              'disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

