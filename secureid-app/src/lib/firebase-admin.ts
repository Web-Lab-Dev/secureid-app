/**
 * FIREBASE ADMIN SDK INITIALIZATION
 *
 * Configuration sécurisée pour les Server Actions Next.js
 * L'Admin SDK bypass les règles Firestore, donc toutes les validations
 * de sécurité doivent être faites dans le code serveur.
 *
 * SÉCURITÉ:
 * - Service account credentials en variables d'environnement
 * - Jamais exposer les credentials côté client
 * - Toujours valider userId === parentId dans les actions
 */

import * as admin from 'firebase-admin';

// Déterminer si on est en mode build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// Initialiser Admin SDK une seule fois (singleton pattern)
if (!admin.apps.length && !isBuildTime) {
  // Vérifier que les credentials sont présents
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId) {
    throw new Error(
      '🔥 FIREBASE ADMIN ERROR: Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable.'
    );
  }

  if (!clientEmail) {
    throw new Error(
      '🔥 FIREBASE ADMIN ERROR: Missing FIREBASE_ADMIN_CLIENT_EMAIL environment variable. Please add it in Vercel Dashboard > Settings > Environment Variables.'
    );
  }

  if (!privateKey) {
    throw new Error(
      '🔥 FIREBASE ADMIN ERROR: Missing FIREBASE_ADMIN_PRIVATE_KEY environment variable. Please add it in Vercel Dashboard > Settings > Environment Variables.'
    );
  }

  // Parser la clé privée pour gérer différents formats
  // Format 1: "-----BEGIN...\\n...\\n-----END..." (avec guillemets et \\n échappés)
  // Format 2: -----BEGIN...\\n...\\n-----END... (sans guillemets)
  // Format 3: -----BEGIN...\n...\n-----END... (avec vrais \n)
  let parsedPrivateKey = privateKey;

  // Enlever les guillemets si présents (Vercel peut les inclure)
  if (parsedPrivateKey.startsWith('"') && parsedPrivateKey.endsWith('"')) {
    parsedPrivateKey = parsedPrivateKey.slice(1, -1);
  }

  // Remplacer \\n échappés par de vrais sauts de ligne
  parsedPrivateKey = parsedPrivateKey.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: parsedPrivateKey,
    }),
  });
}

// Créer des types mock pour le build
type MockFirestore = Partial<FirebaseFirestore.Firestore>;
type MockAuth = Partial<admin.auth.Auth>;

// Fonction helper pour créer les mocks
function createMockFirestore(): MockFirestore {
  return {
    collection: () => {
      throw new Error('Firestore not available during build');
    },
  };
}

function createMockAuth(): MockAuth {
  return {
    getUser: () => {
      throw new Error('Auth not available during build');
    },
  };
}

// Exporter les services Admin (ou mocks pendant le build)
export const adminDb: FirebaseFirestore.Firestore = isBuildTime
  ? (createMockFirestore() as FirebaseFirestore.Firestore)
  : admin.firestore();

export const adminAuth: admin.auth.Auth = isBuildTime
  ? (createMockAuth() as admin.auth.Auth)
  : admin.auth();

// Exporter admin pour les types et utilitaires
export { admin };
