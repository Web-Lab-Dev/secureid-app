/**
 * FIREBASE CONFIGURATION - Initialisation et exports des services Firebase
 *
 * Ce fichier initialise Firebase de manière sécurisée et exporte les instances
 * pour utilisation dans toute l'application.
 *
 * SERVICES UTILISÉS:
 * - Authentication: Gestion des comptes parents (login/signup)
 * - Firestore: Base de données NoSQL (bracelets, profils enfants, scans)
 * - Storage: Stockage de fichiers (photos profils, documents médicaux PDF)
 *
 * SÉCURITÉ:
 * - Toutes les clés API sont dans .env.local (jamais hardcodées)
 * - Validation stricte des variables d'environnement au démarrage
 * - Pattern Singleton pour éviter les réinitialisations multiples
 *
 * @see https://firebase.google.com/docs/web/setup
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Liste des variables d'environnement Firebase obligatoires
 *
 * Ces variables doivent être définies dans .env.local
 * Elles sont préfixées NEXT_PUBLIC_ pour être accessibles côté client
 */
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

/**
 * Validation des variables d'environnement au démarrage
 *
 * LOGIQUE:
 * - Côté serveur (SSR): Lance une erreur fatale si variables manquantes
 * - Côté client: Log une erreur mais continue (évite les crashs en dev)
 *
 * Cette différence permet un meilleur DX en développement tout en
 * garantissant que le build production échouera si configuration incomplète
 */
const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingVars.length > 0) {
  if (typeof window === 'undefined') {
    // Côté serveur - Configuration manquante = erreur critique
    throw new Error(
      `Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}\n` +
      `Assurez-vous d'avoir créé le fichier .env.local à partir de .env.local.example`
    );
  } else {
    // Côté client - Afficher l'erreur mais ne pas crasher l'app
    console.error(
      `Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}\n` +
      `Assurez-vous d'avoir créé le fichier .env.local à partir de .env.local.example`
    );
  }
}

/**
 * Configuration Firebase chargée depuis les variables d'environnement
 *
 * IMPORTANT: Pas de valeurs par défaut (pas de fallback)
 * Si une variable manque, l'application doit échouer explicitement
 * plutôt que de fonctionner avec une configuration incorrecte
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

/**
 * Initialisation Firebase en mode Singleton
 *
 * POURQUOI SINGLETON?
 * En développement avec Next.js, le Hot Module Replacement (HMR)
 * peut réimporter ce module plusieurs fois. Sans cette vérification,
 * Firebase lancerait une erreur "Firebase app already initialized".
 *
 * LOGIQUE:
 * - Si aucune app Firebase n'existe → Initialiser une nouvelle
 * - Si une app existe déjà → Réutiliser l'instance existante
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Instances des services Firebase exportées
 *
 * Ces exports sont utilisés partout dans l'application:
 * - auth: Login/signup/logout des parents
 * - db: Requêtes Firestore (bracelets, profiles, scans, etc.)
 * - storage: Upload/download de fichiers (photos, PDFs médicaux)
 */
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
