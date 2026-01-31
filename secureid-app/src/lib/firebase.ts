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
 * les déconnexions aléatoires sur mobile/PWA.
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

// Flag pour savoir si la persistence a été configurée
let persistenceConfigured = false;

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
 */
async function configureAuthPersistence(authInstance: Auth): Promise<void> {
  if (persistenceConfigured || typeof window === 'undefined') return;

  try {
    // Essayer IndexedDB d'abord (plus fiable)
    await setPersistence(authInstance, indexedDBLocalPersistence);
    persistenceConfigured = true;
  } catch {
    try {
      // Fallback sur localStorage
      await setPersistence(authInstance, browserLocalPersistence);
      persistenceConfigured = true;
    } catch (error) {
      console.error('[Firebase] Impossible de configurer la persistence Auth:', error);
    }
  }
}

// Initialisation
app = initializeFirebase();
auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Configurer la persistence Auth (côté client uniquement)
if (typeof window !== 'undefined') {
  configureAuthPersistence(auth);
}

export { auth, db, storage };
export default app;
