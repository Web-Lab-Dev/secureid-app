import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { ErrorPage } from '@/components/ErrorPage';
import { UnknownStatusPage } from '@/components/UnknownStatusPage';
import { LostModeView } from '@/components/LostModeView';
import { EmergencyViewClient } from './page-client';
import { getOwnerContact } from '@/actions/bracelet-actions';
import { serializeFirestoreData } from '@/lib/firebase-helpers';
import type { BraceletDocument, BraceletStatus } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';

/**
 * SCANNER PAGE - Point d'entrée principal de l'application (Server Component)
 *
 * Cette page gère l'intégralité du flux de scan de QR code.
 * Route dynamique: /s/[slug]?token=xxxxx
 *
 * LOGIQUE DE SÉCURITÉ ANTI-FRAUDE:
 * 1. Vérification de l'existence du bracelet dans Firestore
 * 2. Validation du token secret pour empêcher le clonage de QR codes
 *    → Sans token valide, impossible d'accéder aux données (protection contre photocopies)
 * 3. Aiguillage selon le statut du bracelet (FACTORY_LOCKED, INACTIVE, ACTIVE, LOST, STOLEN)
 *
 * FLUX D'URGENCE:
 * - Si bracelet ACTIVE → Affiche les informations vitales de l'enfant (allergies, groupe sanguin, contacts)
 * - Si bracelet LOST → Permet à un bon samaritain de contacter le parent
 * - Si bracelet STOLEN → Affiche un message piège et enregistre l'IP/localisation du voleur
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
 */

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    t?: string; // Rétrocompatibilité avec anciennes URLs
    token?: string; // Format actuel recommandé
  }>;
}

/**
 * Composant serveur principal - Gère la logique d'authentification et de routage
 *
 * ARCHITECTURE DE SÉCURITÉ:
 * Cette fonction effectue 2 vérifications critiques AVANT d'afficher quoi que ce soit:
 * 1. Le bracelet existe dans notre base de données
 * 2. Le token secret correspond (empêche les QR codes clonés/photocopiés)
 *
 * LOGIQUE MÉTIER - Pourquoi valider le token?
 * → Un QR code peut être photographié/photocopié
 * → Sans validation du token secret, un attaquant pourrait créer de faux bracelets
 * → Le token (64 caractères cryptographiques) est impossible à deviner
 * → Il est stocké dans Firestore ET encodé dans l'URL du QR code gravé
 *
 * @param params - Paramètres de route Next.js (slug = ID du bracelet)
 * @param searchParams - Query parameters (token de sécurité)
 */
export default async function ScanPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const token = searchParamsResolved.token || searchParamsResolved.t;

  const braceletRef = doc(db, 'bracelets', slug);
  const braceletSnap = await getDoc(braceletRef);

  // ============================================================================
  // VÉRIFICATION 1 - Existence du bracelet
  // ============================================================================
  if (!braceletSnap.exists()) {
    return <ErrorPage type="not-found" slug={slug} />;
  }

  const braceletData = braceletSnap.data() as BraceletDocument;

  // ============================================================================
  // VÉRIFICATION 2 - Validation du token secret (CRITIQUE)
  // ============================================================================
  // On vérifie le token ici pour éviter le clonage de QR code:
  // - Le QR code contient l'URL avec le token
  // - Le token est aussi stocké dans Firestore lors de la fabrication
  // - Si les deux ne correspondent pas → QR code falsifié
  const storedToken = braceletData.secretToken;
  const isTokenValid = token && token === storedToken;

  if (!isTokenValid) {
    return <ErrorPage type="counterfeit" slug={slug} token={token} />;
  }

  // ============================================================================
  // AIGUILLAGE SELON LE STATUT DU BRACELET
  // ============================================================================
  // Les statuts possibles:
  // - FACTORY_LOCKED: Bracelet en transit depuis l'usine (non activable)
  // - INACTIVE: Bracelet neuf non encore activé par un parent
  // - ACTIVE: Bracelet en service normal (affiche données d'urgence)
  // - LOST: Mode "bracelet perdu" (affiche contact parent pour restitution)
  // - STOLEN: Mode piège (enregistre les données du voleur)

  const status: BraceletStatus | string = braceletData.status;

  // CAS A: FACTORY_LOCKED - Bracelet en transit depuis l'usine
  // Le bracelet a été fabriqué mais n'est pas encore disponible à la vente
  if (status === 'FACTORY_LOCKED') {
    return <ErrorPage type="factory-locked" slug={slug} />;
  }

  // CAS B: INACTIVE - Bracelet neuf non activé
  // Redirection vers la landing page avec paramètres pour initier l'activation
  if (status === 'INACTIVE') {
    redirect(`/?welcome=true&id=${slug}&token=${token}`);
  }

  // CAS C: ACTIVE - Mode urgence complet
  // Affiche toutes les informations vitales de l'enfant (allergies, groupe sanguin, contacts, etc.)
  if (status === 'ACTIVE') {
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

    // Sérialiser les Timestamps Firestore avant de passer au composant client
    // (les composants client ne peuvent pas recevoir d'objets non-sérialisables)
    const profileData = serializeFirestoreData(rawProfileData) as ProfileDocument;
    const serializedBracelet = serializeFirestoreData(braceletData) as BraceletDocument;

    return <EmergencyViewClient bracelet={serializedBracelet} profile={profileData} />;
  }

  // CAS D: LOST - Mode restitution
  // Affiche uniquement le contact du propriétaire pour qu'un bon samaritain puisse le recontacter
  // Les données médicales restent masquées (pas d'urgence médicale détectée)
  if (status === 'LOST') {
    const ownerContactResult = await getOwnerContact({ braceletId: slug });
    const ownerPhone = ownerContactResult.success ? ownerContactResult.phone : undefined;

    const serializedBracelet = serializeFirestoreData(braceletData) as BraceletDocument;

    return <LostModeView bracelet={serializedBracelet} ownerPhone={ownerPhone} />;
  }

  // CAS E: STOLEN - Mode piège
  // Affiche un message neutre mais enregistre en background l'IP, user-agent et géolocalisation
  // Permet au propriétaire de récupérer des indices sur le voleur
  if (status === 'STOLEN') {
    return <ErrorPage type="stolen" slug={slug} token={token} />;
  }

  // CAS PAR DÉFAUT: Statut non reconnu
  // Affiche un message d'erreur générique sans révéler d'informations techniques
  return <UnknownStatusPage slug={slug} status={status} />;
}
