import { NextResponse } from 'next/server';

/**
 * API Route pour servir la configuration Firebase publique
 * Utilisé par le Service Worker pour initialiser Firebase
 *
 * Sécurité: Ces clés sont publiques (NEXT_PUBLIC_*) mais ne doivent pas être hardcodées
 */
export async function GET() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Vérifier que toutes les variables sont définies
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('[firebase-config] Missing env vars:', missingVars);
    return NextResponse.json(
      { error: 'Firebase configuration incomplete' },
      { status: 500 }
    );
  }

  return NextResponse.json(firebaseConfig, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
