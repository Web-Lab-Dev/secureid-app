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

// Initialiser Admin SDK une seule fois (singleton pattern)
if (!admin.apps.length) {
  // Vérifier que les credentials sont présents
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Please set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in environment variables.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      // La clé privée peut contenir des \n échappés, il faut les remplacer
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

// Exporter les services Admin
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

// Exporter admin pour les types et utilitaires
export { admin };
