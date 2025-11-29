/**
 * API ROUTE DE DIAGNOSTIC - Vérification Firebase Admin SDK sur Vercel
 *
 * Route: /api/diagnostic
 *
 * Permet de vérifier:
 * - Les variables d'environnement sont-elles présentes?
 * - L'Admin SDK s'initialise-t-il correctement?
 * - Peut-on lire depuis Firestore?
 */

import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

export async function GET() {
  const diagnostic = {
    timestamp: new Date().toISOString(),
    environment: {
      projectId: {
        exists: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
      },
      clientEmail: {
        exists: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        value: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'MISSING',
      },
      privateKey: {
        exists: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        firstChars: process.env.FIREBASE_ADMIN_PRIVATE_KEY
          ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.substring(0, 30)
          : 'MISSING',
        lastChars: process.env.FIREBASE_ADMIN_PRIVATE_KEY
          ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.substring(
              process.env.FIREBASE_ADMIN_PRIVATE_KEY.length - 30
            )
          : 'MISSING',
        length: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
        hasRealNewlines: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes('\n') || false,
        hasEscapedNewlines: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.includes('\\n') || false,
      },
    },
    adminSDK: {
      initialized: false,
      error: null as string | null,
    },
    firestoreTest: {
      success: false,
      braceletFound: false,
      error: null as string | null,
      data: null as any,
    },
  };

  // Test 1: Initialiser Admin SDK
  try {
    if (!admin.apps.length) {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        diagnostic.adminSDK.error = 'Missing environment variables';
      } else {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        diagnostic.adminSDK.initialized = true;
      }
    } else {
      diagnostic.adminSDK.initialized = true;
    }
  } catch (error) {
    diagnostic.adminSDK.error = error instanceof Error ? error.message : String(error);
  }

  // Test 2: Lire un bracelet depuis Firestore
  if (diagnostic.adminSDK.initialized) {
    try {
      const db = admin.firestore();
      const braceletRef = db.collection('bracelets').doc('TEST-001');
      const braceletSnap = await braceletRef.get();

      diagnostic.firestoreTest.success = true;
      diagnostic.firestoreTest.braceletFound = braceletSnap.exists;

      if (braceletSnap.exists) {
        const data = braceletSnap.data();
        diagnostic.firestoreTest.data = {
          id: 'TEST-001',
          status: data?.status,
          hasSecretToken: !!data?.secretToken,
          secretTokenPreview: data?.secretToken?.substring(0, 20) + '...',
        };
      }
    } catch (error) {
      diagnostic.firestoreTest.error = error instanceof Error ? error.message : String(error);
    }
  }

  return NextResponse.json(diagnostic, { status: 200 });
}
