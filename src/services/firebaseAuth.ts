import {
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './firebase';
import type { User } from '@/types';

/**
 * Auth result type matching existing store interface
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Maps a Firebase User to the application User type
 */
export function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    fullName:
      firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
    displayName:
      firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'User',
    avatarUrl: firebaseUser.photoURL ?? undefined,
    plan: 'free',
    createdAt:
      firebaseUser.metadata.creationTime ?? new Date().toISOString(),
    updatedAt:
      firebaseUser.metadata.lastSignInTime ?? new Date().toISOString(),
    providerId: firebaseUser.providerData[0]?.providerId,
    emailVerified: firebaseUser.emailVerified,
  };
}

/**
 * Firebase Auth error code to i18n key mapping
 */
export const firebaseErrorMessages: Record<string, string> = {
  'auth/operation-not-allowed': 'auth.errors.operationNotAllowed',
  'auth/user-disabled': 'auth.errors.userDisabled',
  'auth/popup-closed-by-user': 'auth.errors.popupClosed',
  'auth/network-request-failed': 'auth.errors.networkError',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/requires-recent-login': 'auth.errors.requiresRecentLogin',
};

/**
 * Get the i18n key for a Firebase Auth error code
 */
export function getFirebaseErrorKey(errorCode: string): string {
  return firebaseErrorMessages[errorCode] ?? 'auth.errors.unknown';
}

/**
 * Extract error code from Firebase Auth error
 */
export function getFirebaseErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  return 'auth/unknown';
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Sign in with Google using popup
 */
export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const user = mapFirebaseUser(credential.user);
    return { success: true, user };
  } catch (error) {
    const errorCode = getFirebaseErrorCode(error);

    // Handle popup closed by user gracefully (not an error)
    if (errorCode === 'auth/popup-closed-by-user') {
      return {
        success: false,
        error: undefined, // No error message for user cancellation
      };
    }

    return {
      success: false,
      error: getFirebaseErrorKey(errorCode),
    };
  }
}

/**
 * Subscribe to auth state changes
 * @param callback - Called with User when logged in, null when logged out
 * @returns Unsubscribe function to stop listening
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUser(firebaseUser));
    } else {
      callback(null);
    }
  });
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user is currently signed in');
  }

  await updateProfile(currentUser, updates);
}
