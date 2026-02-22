import { ArrowRight, Loader2 } from 'lucide-react';
import { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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

  const handleSubmit = useCallback(() => {
    if (isSearching || disabled) return;
    if (!value.trim()) return;
    onSubmit(value.trim());
  }, [isSearching, disabled, value, onSubmit]);

  const canSearch = !!value.trim();

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
        <div className="flex items-center justify-end pt-1.5">
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
  );
}
