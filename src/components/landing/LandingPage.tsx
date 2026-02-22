import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { QuickActionChips } from './QuickActionChips';
import { FeatureCards } from './FeatureCards';
import { HowItWorks } from './HowItWorks';
import { UseCases } from './UseCases';
import { PricingSection } from './PricingSection';
import { LandingFooter } from './LandingFooter';
import { SearchComposer } from '@/components/search/SearchComposer';
import { SearchResultList } from '@/components/search/SearchResultList';
import { useSearchStore } from '@/stores/useSearchStore';

export function LandingPage() {
  const { t } = useTranslation();
  const query = useSearchStore((s) => s.query);
  const results = useSearchStore((s) => s.results);
  const isSearching = useSearchStore((s) => s.isSearching);
  const hasSearched = useSearchStore((s) => s.hasSearched);
  const error = useSearchStore((s) => s.error);
  const setQuery = useSearchStore((s) => s.setQuery);
  const search = useSearchStore((s) => s.search);

  const handleChipSelect = useCallback(
    (chipQuery: string) => {
      setQuery(chipQuery);
      void search(chipQuery);
    },
    [setQuery, search]
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Ambient gradient background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'radial-gradient(85% 65% at 50% -10%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 62%), radial-gradient(90% 70% at 0% 0%, color-mix(in oklch, var(--accent) 14%, transparent), transparent 58%), radial-gradient(90% 70% at 100% 0%, color-mix(in oklch, var(--info) 16%, transparent), transparent 58%), linear-gradient(180deg, color-mix(in oklch, var(--background-elevated) 86%, transparent), transparent)',
        }}
      />

      <div className="relative flex min-h-screen flex-col">
        <LandingNavbar />

        <main className="flex-1">
          {/* Hero */}
          <HeroSection />

          {/* Search Composer */}
          <div className="mx-auto w-full max-w-3xl px-4">
            <SearchComposer
              value={query}
              onChange={setQuery}
              onSubmit={(q) => void search(q)}
              isSearching={isSearching}
            />
            {error && (
              <p className="mt-2 text-sm text-destructive">
                {t('errors.generic')}: {error}
              </p>
            )}
          </div>

          {/* Quick Action Chips (hidden after search) */}
          {!hasSearched && <QuickActionChips onSelect={handleChipSelect} />}

          {/* Search Results */}
          {hasSearched && (
            <section className="mx-auto mt-6 w-full max-w-4xl px-4">
              <div className="rounded-2xl border border-border-hairline/70 bg-background-elevated/65 p-4 shadow-card sm:p-5">
                <SearchResultList
                  results={results}
                  isSearching={isSearching}
                  hasSearched={hasSearched}
                />
              </div>
            </section>
          )}

          {/* Landing sections (hidden after search) */}
          {!hasSearched && (
            <>
              <FeatureCards />
              <HowItWorks />
              <UseCases />
              <PricingSection />
            </>
          )}
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
