import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { ErrorPage } from '@/components/ErrorPage';
import { EmergencyModePlaceholder } from '@/components/EmergencyModePlaceholder';
import { UnknownStatusPage } from '@/components/UnknownStatusPage';
import { BraceletData, BraceletStatus } from '@/types/bracelet';

/**
 * PHASE 2.1 - ROUTEUR OPTIMISÉ
 *
 * Page dynamique de scan des bracelets QR Code
 * Route: /s/[slug]?t=token
 *
 * Améliorations:
 * - Types TypeScript stricts
 * - Composants extraits et réutilisables
 * - Meilleure maintenabilité
 */

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

  console.log('🔍 [SCAN] Slug:', slug);
  console.log('🔑 [SCAN] Token:', token);

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
  const braceletData = braceletSnap.data() as BraceletData;

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

  // CAS B: Bracelet ACTIVE → Afficher mode urgence (placeholder)
  if (status === 'ACTIVE') {
    return <EmergencyModePlaceholder braceletData={braceletData} />;
  }

  // CAS C: Bracelet STOLEN → Afficher message piège
  if (status === 'STOLEN') {
    return <ErrorPage type="stolen" slug={slug} token={token} />;
  }

  // CAS PAR DÉFAUT: Status inconnu
  return <UnknownStatusPage slug={slug} status={status} />;
}
