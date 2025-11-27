import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { ErrorPage } from '@/components/ErrorPage';
import { UnknownStatusPage } from '@/components/UnknownStatusPage';
import { EmergencyViewClient } from './page-client';
import type { BraceletDocument, BraceletStatus } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 5 - SCANNER PAGE (SERVER COMPONENT)
 *
 * Page dynamique de scan des bracelets QR Code
 * Route: /s/[slug]?t=token
 *
 * Améliorations Phase 5:
 * - Fetch profile data pour affichage informations vitales
 * - Remplacement EmergencyModePlaceholder par EmergencyViewClient
 */

// Helper pour sérialiser les Firestore Timestamps en plain objects
function serializeFirestoreData<T>(data: T): T {
  // Utiliser JSON.parse(JSON.stringify()) pour convertir les Timestamps
  return JSON.parse(JSON.stringify(data, (key, value) => {
    // Convertir les Timestamps Firestore en strings ISO
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      return new Date(value.seconds * 1000).toISOString();
    }
    return value;
  }));
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    t?: string; // Token de sécurité
  }>;
}

export default async function ScanPage({ params, searchParams }: PageProps) {
  // Récupération des paramètres (await pour Next.js 16)
  const { slug } = await params;
  const { t: token } = await searchParams;

  // Interroger Firestore pour récupérer le bracelet
  const braceletRef = doc(db, 'bracelets', slug);
  const braceletSnap = await getDoc(braceletRef);

  // ============================================================================
  // VÉRIFICATION 1 - Le bracelet existe-t-il?
  // ============================================================================
  if (!braceletSnap.exists()) {
    return <ErrorPage type="not-found" slug={slug} />;
  }

  // Récupérer les données du bracelet avec typage strict
  const braceletData = braceletSnap.data() as BraceletDocument;

  // ============================================================================
  // VÉRIFICATION 2 - Le token est-il valide? (Anti-Fraude)
  // ============================================================================
  const storedToken = braceletData.secretToken;
  const isTokenValid = token && token === storedToken;

  if (!isTokenValid) {
    return <ErrorPage type="counterfeit" slug={slug} token={token} />;
  }

  // ============================================================================
  // TOUTES LES VÉRIFICATIONS SONT PASSÉES ✅
  // ÉTAPE 4: AIGUILLAGE SELON LE STATUS
  // ============================================================================

  const status: BraceletStatus | string = braceletData.status;

  // CAS A: Bracelet INACTIVE (neuf) → Rediriger vers activation
  if (status === 'INACTIVE') {
    redirect(`/activate?id=${slug}&token=${token}`);
  }

  // CAS B: Bracelet ACTIVE → Afficher mode urgence complet
  if (status === 'ACTIVE') {
    // Récupérer le profil lié au bracelet
    const profileId = braceletData.linkedProfileId;

    if (!profileId) {
      return (
        <ErrorPage
          type="not-found"
          slug={slug}
        />
      );
    }

    const profileRef = doc(db, 'profiles', profileId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return (
        <ErrorPage
          type="not-found"
          slug={slug}
        />
      );
    }

    const rawProfileData = {
      id: profileSnap.id,
      ...profileSnap.data(),
    };

    // Sérialiser les Timestamps pour les passer au composant client
    const profileData = serializeFirestoreData(rawProfileData) as ProfileDocument;
    const serializedBracelet = serializeFirestoreData(braceletData) as BraceletDocument;

    return <EmergencyViewClient bracelet={serializedBracelet} profile={profileData} />;
  }

  // CAS C: Bracelet STOLEN → Afficher message piège
  if (status === 'STOLEN') {
    return <ErrorPage type="stolen" slug={slug} token={token} />;
  }

  // CAS PAR DÉFAUT: Status inconnu
  return <UnknownStatusPage slug={slug} status={status} />;
}
