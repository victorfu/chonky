import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SearchResult } from '@/types';
import { SearchResultCard } from './SearchResultCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface SearchResultListProps {
  results: SearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
}

export function SearchResultList({
  results,
  isSearching,
  hasSearched,
}: SearchResultListProps) {
  const { t } = useTranslation();

  if (isSearching) {
    return (
      <div className="flex h-44 items-center justify-center">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-sm text-muted-foreground">
          {t('search.searching', 'Searching...')}
        </span>
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-10 w-10" />}
        title={t('search.noResults', 'No results found')}
        description={t(
          'search.noResultsDesc',
          'Try different keywords or broaden your search.'
        )}
      />
    );
  }

  if (!hasSearched) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('search.resultCount', '{{count}} results found', {
          count: results.length,
        })}
      </p>
      {results.map((result) => (
        <SearchResultCard key={result.card.id} result={result} />
      ))}
    </div>
  );
}
