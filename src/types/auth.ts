export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  avatarUrl?: string;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
  // Firebase-specific optional fields
  providerId?: string; // 'google.com' | etc.
  emailVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
