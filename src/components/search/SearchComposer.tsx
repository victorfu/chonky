import { ArrowRight, Loader2, Plus, Sparkles, ChevronDown } from 'lucide-react';
import { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@/components/ui/Dropdown';
import {
  SUPPORTED_MODELS,
  MODEL_LABELS,
  DEFAULT_MODEL,
  type ModelType,
} from '@/types';

interface SearchComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isSearching: boolean;
  disabled?: boolean;
}

export function SearchComposer({
  value,
  onChange,
  onSubmit,
  isSearching,
  disabled = false,
}: SearchComposerProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>(DEFAULT_MODEL);

  const handleSubmit = useCallback(() => {
    if (isSearching || disabled) return;
    if (!value.trim()) return;
    onSubmit(value.trim());
  }, [isSearching, disabled, value, onSubmit]);

  const canSearch = !!value.trim();

  const shortLabel = MODEL_LABELS[selectedModel]
    .replace('Gemini ', '')
    .replace(' Lite', ' Lite');

  const modelDropdownItems = SUPPORTED_MODELS.map((model) => ({
    id: model,
    label: MODEL_LABELS[model].replace('Gemini ', ''),
    onClick: () => setSelectedModel(model),
  }));

  return (
    <div
      className="relative cursor-text overflow-hidden rounded-2xl border border-border-hairline bg-card/80 shadow-card backdrop-blur-xl transition-all motion-safe:duration-200 focus-within:border-accent/40 focus-within:shadow-card-hover"
      onClick={() => textareaRef.current?.focus()}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(90% 120% at 50% -20%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 64%)',
        }}
      />
      <div className="relative flex flex-col px-4 pt-3 pb-2.5 sm:px-5 sm:pt-4 sm:pb-3">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isSearching || disabled}
          placeholder={t('search.placeholder', 'Search knowledge base...')}
          rows={3}
          style={{ outline: 'none' }}
          className="min-h-[72px] flex-1 resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-1.5">
          {/* Left: attachment button */}
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-hairline bg-background-elevated/50 text-muted-foreground transition-colors hover:bg-background-elevated hover:text-foreground"
            aria-label={t('search.attach')}
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Right: model selector + submit */}
          <div className="flex items-center gap-2">
            {/* Model selector */}
            <Dropdown
              trigger={
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-hairline bg-background-elevated/50 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{shortLabel}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              }
              items={modelDropdownItems}
              position="top-end"
            />

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || !canSearch || isSearching}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-sm transition-all motion-safe:duration-200 hover:bg-accent/90 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
