import { useTranslation } from 'react-i18next';
import { SearchComposer } from './SearchComposer';
import { SearchResultList } from './SearchResultList';
import { Logo } from '@/components/ui/Logo';
import { useSearchStore } from '@/stores/useSearchStore';

export function SearchHomePage() {
  const { t } = useTranslation();

  const query = useSearchStore((s) => s.query);
  const results = useSearchStore((s) => s.results);
  const isSearching = useSearchStore((s) => s.isSearching);
  const hasSearched = useSearchStore((s) => s.hasSearched);
  const error = useSearchStore((s) => s.error);
  const setQuery = useSearchStore((s) => s.setQuery);
  const search = useSearchStore((s) => s.search);

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(85% 65% at 50% -10%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 62%), radial-gradient(90% 70% at 0% 0%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 58%), radial-gradient(90% 70% at 100% 0%, color-mix(in oklch, var(--info) 16%, transparent), transparent 58%), linear-gradient(180deg, color-mix(in oklch, var(--background-elevated) 86%, transparent), transparent)',
        }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-10 sm:px-8 sm:py-14">
        {!hasSearched && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <Logo size="lg" />
            <h1 className="text-3xl font-semibold tracking-tight">
              {import.meta.env.VITE_APP_NAME || 'Chonky'}
            </h1>
            <p className="text-base text-muted-foreground">
              {t('search.tagline', 'Search our knowledge base')}
            </p>
          </div>
        )}

        <div className="w-full max-w-4xl">
          <SearchComposer
            value={query}
            onChange={setQuery}
            onSubmit={(q) => void search(q)}
            isSearching={isSearching}
          />
          {error && (
            <p className="mt-2 text-sm text-destructive">
              {t('errors.generic', 'Error')}: {error}
            </p>
          )}
        </div>

        {hasSearched && (
          <section className="mt-6 w-full max-w-5xl rounded-2xl border border-border-hairline/70 bg-background-elevated/65 p-4 shadow-card sm:p-5">
            <SearchResultList
              results={results}
              isSearching={isSearching}
              hasSearched={hasSearched}
            />
          </section>
        )}
      </div>
    </div>
  );
}
