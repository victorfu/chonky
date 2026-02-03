import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const appCheckKey = import.meta.env.VITE_FIREBASE_APPCHECK_KEY;

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missingVars = requiredEnvVars.filter((varName) => !import.meta.env[varName]);

if (missingVars.length > 0) {
  throw new Error(
    `Firebase environment variables are missing: ${missingVars.join(', ')}. Check your .env.local file.`
  );
}

// Initialize Firebase app (handle hot reload)
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);

  // Set up App Check debug token in development
  if (typeof window !== 'undefined') {
    if (import.meta.env.DEV) {
      const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || true;
      (
        globalThis as typeof globalThis & {
          FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean;
        }
      ).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    } else {
      delete (
        globalThis as typeof globalThis & {
          FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean;
        }
      ).FIREBASE_APPCHECK_DEBUG_TOKEN;
    }
  }
} else {
  app = getApps()[0]!;
}

// Initialize App Check (browser only)
let appCheck: AppCheck | undefined;

if (typeof window !== 'undefined' && appCheckKey) {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckKey),
    isTokenAutoRefreshEnabled: true,
  });
} else if (!appCheckKey && !import.meta.env.DEV) {
  console.warn('VITE_FIREBASE_APPCHECK_KEY is not configured. App Check is disabled.');
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(
  app,
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_NAME || '(default)'
);
export const storage: FirebaseStorage = getStorage(app);

// Initialize Firebase AI (for dynamic model selection)
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// Export app and appCheck for advanced usage
export { app, appCheck };
