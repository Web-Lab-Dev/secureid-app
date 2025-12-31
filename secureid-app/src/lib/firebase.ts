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
 * Validation des variables d'environnement Firebase
 *
 * IMPORTANT: Next.js remplace process.env.NEXT_PUBLIC_* uniquement avec l'accès direct,
 * PAS avec la notation entre crochets (process.env[varName]).
 *
 * Cette fonction valide que toutes les variables requises sont présentes.
 * En production Vercel, les variables sont injectées au moment du build.
 *
 * LOGIQUE:
 * - Côté serveur (SSR): Lance une erreur fatale si variables manquantes
 * - Côté client: Log une erreur mais continue (évite les crashs en dev)
 */
function validateFirebaseConfig() {
  const missingVars: string[] = [];

  // ⚠️ CRITIQUE: Utiliser l'accès direct pour que Next.js puisse injecter les variables
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (missingVars.length > 0) {
    if (typeof window === 'undefined') {
      // Côté serveur - Configuration manquante = erreur critique
      throw new Error(
        `Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}\n` +
        `En production Vercel: Vérifiez que les variables sont configurées dans Settings > Environment Variables\n` +
        `En local: Créez le fichier .env.local avec toutes les variables NEXT_PUBLIC_FIREBASE_*`
      );
    } else {
      // Côté client - Afficher l'erreur mais ne pas crasher l'app
      console.error(
        `Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}\n` +
        `En production Vercel: Vérifiez que les variables sont configurées dans Settings > Environment Variables\n` +
        `En local: Créez le fichier .env.local avec toutes les variables NEXT_PUBLIC_FIREBASE_*`
      );
    }
  }
}

// Valider la configuration au chargement du module
validateFirebaseConfig();

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
