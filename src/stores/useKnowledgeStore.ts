import { create } from 'zustand';
import type { KnowledgeCard, KnowledgeCardInput } from '@/types';
import {
  addKnowledgeCard,
  deleteKnowledgeCard,
  subscribeKnowledgeCards,
  updateKnowledgeCard,
} from '@/services/firestoreKnowledge';
import { useAuthStore } from './useAuthStore';

interface KnowledgeStore {
  cards: KnowledgeCard[];
  isLoading: boolean;
  error: string | null;
  editingCard: KnowledgeCard | null;

  initialize: () => () => void;
  setEditingCard: (card: KnowledgeCard | null) => void;
  addCard: (input: Omit<KnowledgeCardInput, 'createdBy'>) => Promise<string>;
  updateCard: (id: string, updates: Partial<KnowledgeCardInput>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

export const useKnowledgeStore = create<KnowledgeStore>((set, get) => {
  let authStoreUnsubscribe: (() => void) | null = null;
  let cardsUnsubscribe: (() => void) | null = null;
  let activeUid: string | null = null;

  return {
    cards: [],
    isLoading: false,
    error: null,
    editingCard: null,

    initialize: () => {
      const bindCards = (uid: string | null) => {
        if (activeUid === uid) return;

        cardsUnsubscribe?.();
        cardsUnsubscribe = null;
        activeUid = uid;

        if (!uid) {
          set({ cards: [], isLoading: false, error: null });
          return;
        }

        set({ isLoading: true, error: null });

        cardsUnsubscribe = subscribeKnowledgeCards(
          (cards) => {
            set({ cards, isLoading: false });
          },
          (error) => {
            console.error('Failed to subscribe knowledge cards:', error);
            set({ error: 'Failed to load knowledge cards', isLoading: false });
          }
        );
      };

      const initialUid = useAuthStore.getState().user?.id ?? null;
      bindCards(initialUid);

      authStoreUnsubscribe?.();
      authStoreUnsubscribe = useAuthStore.subscribe((state, previousState) => {
        const uid = state.user?.id ?? null;
        const previousUid = previousState.user?.id ?? null;
        if (uid !== previousUid) {
          bindCards(uid);
        }
      });

      return () => {
        authStoreUnsubscribe?.();
        authStoreUnsubscribe = null;
        cardsUnsubscribe?.();
        cardsUnsubscribe = null;
        activeUid = null;
      };
    },

    setEditingCard: (card) => {
      set({ editingCard: card });
    },

    addCard: async (input) => {
      const uid = useAuthStore.getState().user?.id;
      if (!uid) throw new Error('User must be signed in');

      try {
        const id = await addKnowledgeCard({ ...input, createdBy: uid });
        return id;
      } catch (error) {
        console.error('Failed to add knowledge card:', error);
        throw error;
      }
    },

    updateCard: async (id, updates) => {
      try {
        await updateKnowledgeCard(id, updates);
      } catch (error) {
        console.error('Failed to update knowledge card:', error);
        throw error;
      }
    },

    deleteCard: async (id) => {
      try {
        await deleteKnowledgeCard(id);
        if (get().editingCard?.id === id) {
          set({ editingCard: null });
        }
      } catch (error) {
        console.error('Failed to delete knowledge card:', error);
        throw error;
      }
    },

    toggleStatus: async (id) => {
      const card = get().cards.find((c) => c.id === id);
      if (!card) return;
      const newStatus = card.status === 'published' ? 'draft' : 'published';
      await updateKnowledgeCard(id, { status: newStatus });
    },
  };
});
