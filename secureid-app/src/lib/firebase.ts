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
 * IMPORTANT: La persistence Auth est configurée ET on attend que Firebase
 * ait lu l'état depuis le storage avant de considérer auth comme "prêt".
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  onAuthStateChanged,
  Auth,
  User
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

// État d'auth initial (lu depuis le storage)
let initialAuthUser: User | null = null;
let authReadyPromise: Promise<User | null> | null = null;

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
 * Configure la persistence Auth et attend que Firebase lise l'état depuis storage
 * Retourne l'utilisateur initial (ou null si pas connecté)
 */
async function initializeAuth(authInstance: Auth): Promise<User | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  console.log('[Firebase] initializeAuth starting...');

  // 1. Configurer la persistence
  try {
    await setPersistence(authInstance, indexedDBLocalPersistence);
    console.log('[Firebase] Auth persistence: IndexedDB OK');
  } catch (indexedDBError) {
    console.warn('[Firebase] IndexedDB failed, trying localStorage:', indexedDBError);
    try {
      await setPersistence(authInstance, browserLocalPersistence);
      console.log('[Firebase] Auth persistence: localStorage OK');
    } catch (localStorageError) {
      console.error('[Firebase] All persistence methods failed:', localStorageError);
    }
  }

  // 2. Attendre que Firebase lise l'état auth depuis le storage
  console.log('[Firebase] Waiting for auth state...');
  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      unsubscribe();
      initialAuthUser = user;
      console.log('[Firebase] Auth ready, user:', user ? user.uid : 'null');
      resolve(user);
    });

    // Timeout réduit à 3 secondes
    setTimeout(() => {
      unsubscribe();
      console.warn('[Firebase] Auth timeout after 3s, resolving null');
      resolve(null);
    }, 3000);
  });
}

// Initialisation
app = initializeFirebase();
auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Initialiser l'auth (côté client uniquement)
if (typeof window !== 'undefined') {
  authReadyPromise = initializeAuth(auth);
} else {
  authReadyPromise = Promise.resolve(null);
}

/**
 * Attend que Firebase Auth soit prêt (persistence configurée + état lu)
 * Retourne l'utilisateur initial ou null
 */
export function waitForAuthReady(): Promise<User | null> {
  return authReadyPromise || Promise.resolve(null);
}

/**
 * Retourne l'utilisateur initial (synchrone, après que authReady soit résolu)
 */
export function getInitialAuthUser(): User | null {
  return initialAuthUser;
}

export { auth, db, storage };
export default app;
