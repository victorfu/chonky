import { memo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import type { SearchResult } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface SearchResultCardProps {
  result: SearchResult;
}

export const SearchResultCard = memo(function SearchResultCard({
  result,
}: SearchResultCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { card, aiSummary } = result;

  return (
    <div className="rounded-[12px] border border-border-hairline bg-background-elevated/88 p-4 shadow-sm transition-all motion-safe:duration-200 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-tight">{card.title}</h3>
          {card.category && (
            <Badge variant="primary" size="sm" className="mt-1.5">
              {card.category}
            </Badge>
          )}
        </div>
        {card.imageUrl && (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="h-16 w-16 rounded-lg object-cover shrink-0"
          />
        )}
      </div>

      {aiSummary && (
        <p className="mt-2 text-sm text-accent leading-relaxed">{aiSummary}</p>
      )}

      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {card.description}
      </p>

      {card.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {card.content && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-3 inline-flex items-center gap-1 text-sm text-accent transition-colors motion-safe:duration-200 hover:text-accent/85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            {expanded
              ? t('search.collapse', 'Collapse')
              : t('search.viewMore', 'View details')}
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {expanded && (
            <div className="prose prose-sm mt-3 max-w-none rounded-lg border border-border-hairline bg-background/60 p-4">
              <ReactMarkdown>{card.content}</ReactMarkdown>
            </div>
          )}
        </>
      )}
    </div>
  );
});
