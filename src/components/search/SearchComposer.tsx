import { ArrowRight, Loader2, Search } from 'lucide-react';
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

  const handleSubmit = () => {
    if (isSearching || disabled) return;
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  const canSearch = !!value.trim();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-hairline bg-card/80 shadow-card backdrop-blur-xl transition-all motion-safe:duration-200 focus-within:border-accent/40 focus-within:shadow-card-hover">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(90% 120% at 50% -20%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 64%)',
        }}
      />
      <div className="relative flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isSearching || disabled}
          placeholder={t('search.placeholder', 'Search knowledge base...')}
          className="h-11 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !canSearch || isSearching}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-hairline bg-background-elevated/70 text-muted-foreground shadow-sm transition-all motion-safe:duration-200 hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-40"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
