import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validation des variables d'environnement Firebase
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

// Vérifier que toutes les variables requises sont définies
// Note: Cette vérification peut échouer côté client si les variables ne sont pas encore chargées
const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingVars.length > 0) {
  // En développement, afficher un warning au lieu de throw pour éviter les erreurs de build
  if (typeof window === 'undefined') {
    // Côté serveur - c'est critique
    throw new Error(
      `Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}\n` +
      `Assurez-vous d'avoir créé le fichier .env.local à partir de .env.local.example`
    );
  } else {
    // Côté client - logger et continuer
    console.error(
      `Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}\n` +
      `Assurez-vous d'avoir créé le fichier .env.local à partir de .env.local.example`
    );
  }
}

// Configuration Firebase à partir des variables d'environnement
// SÉCURITÉ: Pas de fallback - l'application doit échouer si variables manquantes
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialisation Singleton de Firebase
// Évite les réinitialisations multiples en mode développement
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Exportation des instances Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
