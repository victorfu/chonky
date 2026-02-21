import { create } from 'zustand';
import type { SearchResult } from '@/types';
import { searchKnowledgeCards } from '@/services/firestoreKnowledge';
import { rankSearchResults } from '@/services/searchProvider';
import { useSettingsStore } from './useSettingsStore';

interface SearchStore {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
  error: string | null;

  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

function tokenizeQuery(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  results: [],
  isSearching: false,
  hasSearched: false,
  error: null,

  setQuery: (query) => {
    set({ query });
  },

  search: async (input) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    set({ query: trimmed, isSearching: true, error: null, hasSearched: true });

    try {
      const keywords = tokenizeQuery(trimmed);
      if (keywords.length === 0) {
        set({ results: [], isSearching: false });
        return;
      }

      const cards = await searchKnowledgeCards(keywords);

      if (cards.length === 0) {
        set({ results: [], isSearching: false });
        return;
      }

      const { general, search } = useSettingsStore.getState().settings;

      let results: SearchResult[];
      if (search.enableAIRanking) {
        results = await rankSearchResults(trimmed, cards, {
          language: general.language,
          model: general.defaultModel,
        });
      } else {
        results = cards.map((card) => ({
          card,
          relevanceScore: 0.5,
          aiSummary: '',
        }));
      }

      // Limit results
      results = results.slice(0, search.maxResults);

      set({ results, isSearching: false });
    } catch (error) {
      console.error('Search failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Search failed',
        isSearching: false,
      });
    }
  },

  clearResults: () => {
    set({ query: '', results: [], hasSearched: false, error: null });
  },
}));
