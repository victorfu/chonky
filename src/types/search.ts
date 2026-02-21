import type { KnowledgeCard } from './knowledge';

export interface SearchResult {
  card: KnowledgeCard;
  relevanceScore: number;
  aiSummary: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
  error: string | null;
}
