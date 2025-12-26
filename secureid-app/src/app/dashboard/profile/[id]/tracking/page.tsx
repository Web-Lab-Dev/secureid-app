import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GpsSimulationCard } from '@/components/dashboard/GpsSimulationCard';
import { GpsDisclaimerModal } from '@/components/dashboard/GpsDisclaimerModal';
import { HealthIndicators } from '@/components/dashboard/HealthIndicators';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 15 - PAGE TRACKING GPS (SERVER COMPONENT)
 *
 * Page dédiée pour afficher le tracking GPS simulé
 * - Header avec bouton retour
 * - Affichage du composant GpsSimulationCard
 * - Layout sombre immersif
 * - Chargement du profil pour afficher la photo
 *
 * Route: /dashboard/profile/[id]/tracking
 * Protection: AuthGuard dans dashboard/layout.tsx
 */

interface TrackingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { id } = await params;

  // Charger le profil de l'enfant
  let profile: ProfileDocument | null = null;
  try {
    const profileRef = doc(db, 'profiles', id);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      profile = profileSnap.data() as ProfileDocument;
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Modale Disclaimer */}
      <GpsDisclaimerModal />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Localisation Temps Réel
            </h1>
            <p className="mt-1 text-slate-400">
              Suivez la position de {profile?.fullName || 'votre enfant'} en direct
            </p>
          </div>
        </div>

        {/* Composant GPS Simulé */}
        <GpsSimulationCard
          childName={profile?.fullName}
          childPhotoUrl={profile?.photoUrl || undefined}
        />

        {/* Indicateurs de santé */}
        <div className="mt-6">
          <HealthIndicators childName={profile?.fullName} />
        </div>
      </div>
    </div>
  );
}
