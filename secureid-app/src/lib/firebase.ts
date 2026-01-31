/**
 * FIREBASE CLIENT SDK - Configuration et initialisation
 *
 * Ce fichier initialise Firebase côté client et exporte les instances
 * pour utilisation dans toute l'application.
 *
 * SERVICES:
 * - Authentication: Gestion des comptes (login/signup)
 * - Firestore: Base de données NoSQL
 * - Storage: Stockage de fichiers
 *
 * IMPORTANT: La persistence Auth est configurée explicitement pour éviter
 * les déconnexions aléatoires sur mobile/PWA. Le hook useAuth DOIT attendre
 * que authReady soit résolu avant de configurer onAuthStateChanged.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Validation des variables d'environnement
function validateConfig(): void {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && typeof window !== 'undefined') {
    console.error(`[Firebase] Variables manquantes: ${missing.join(', ')}`);
  }
}

validateConfig();

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton Firebase App
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Promise qui se résout quand Auth est prêt (persistence configurée)
let authReadyResolve: () => void;
let authReadyPromise: Promise<void> | null = null;

/**
 * Initialise Firebase (singleton pattern)
 */
function initializeFirebase(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

/**
 * Configure la persistence Auth pour éviter les déconnexions
 * Utilise IndexedDB en priorité, localStorage en fallback
 *
 * IMPORTANT: Cette fonction DOIT être awaited avant d'utiliser onAuthStateChanged
 */
async function configureAuthPersistence(authInstance: Auth): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Essayer IndexedDB d'abord (plus fiable sur mobile/PWA)
    await setPersistence(authInstance, indexedDBLocalPersistence);
    console.log('[Firebase] Auth persistence: IndexedDB');
  } catch (indexedDBError) {
    console.warn('[Firebase] IndexedDB failed, trying localStorage:', indexedDBError);
    try {
      // Fallback sur localStorage
      await setPersistence(authInstance, browserLocalPersistence);
      console.log('[Firebase] Auth persistence: localStorage');
    } catch (localStorageError) {
      console.error('[Firebase] All persistence methods failed:', localStorageError);
    }
  }
}

// Initialisation
app = initializeFirebase();
auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Créer la promise authReady (côté client uniquement)
if (typeof window !== 'undefined') {
  authReadyPromise = new Promise<void>((resolve) => {
    authReadyResolve = resolve;
  });

  // Configurer la persistence et résoudre la promise
  configureAuthPersistence(auth).finally(() => {
    authReadyResolve();
  });
} else {
  // Côté serveur, résoudre immédiatement
  authReadyPromise = Promise.resolve();
}

/**
 * Attend que Firebase Auth soit prêt (persistence configurée)
 * DOIT être appelé avant onAuthStateChanged pour éviter les déconnexions
 */
export function waitForAuthReady(): Promise<void> {
  return authReadyPromise || Promise.resolve();
}

export { auth, db, storage };
export default app;
