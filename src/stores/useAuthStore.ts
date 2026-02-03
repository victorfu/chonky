import { create } from 'zustand';
import type { User } from '@/types';
import {
  type AuthResult,
  loginWithGoogle as firebaseLoginWithGoogle,
  signOut,
  onAuthStateChange,
  updateUserProfile,
} from '@/services/firebaseAuth';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => () => void;
  loginWithGoogle: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });

    // Return unsubscribe function for cleanup
    return unsubscribe;
  },

  loginWithGoogle: async () => {
    const result = await firebaseLoginWithGoogle();
    // State will be updated by onAuthStateChange listener
    return result;
  },

  logout: async () => {
    await signOut();
    // State will be updated by onAuthStateChange listener
  },

  updateUser: async (updates: Partial<User>) => {
    const user = get().user;
    if (!user) return;

    // Update Firebase profile if displayName or avatarUrl changed
    const profileUpdates: { displayName?: string; photoURL?: string } = {};

    if (updates.displayName || updates.fullName) {
      profileUpdates.displayName = updates.displayName ?? updates.fullName;
    }

    if (updates.avatarUrl) {
      profileUpdates.photoURL = updates.avatarUrl;
    }

    if (Object.keys(profileUpdates).length > 0) {
      await updateUserProfile(profileUpdates);
    }

    // Update local state with all updates
    const updatedUser = { ...user, ...updates };
    set({ user: updatedUser });
  },
}));

// Re-export AuthResult for convenience
export type { AuthResult };
