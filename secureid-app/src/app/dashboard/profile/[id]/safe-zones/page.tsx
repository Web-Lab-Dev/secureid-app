import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import { SafeZonesClient } from './safe-zones-client';
import { Loader2 } from 'lucide-react';
import type { ProfileDocument } from '@/types/profile';

/**
 * PAGE CONFIGURATION ZONES SÛRES
 *
 * Route: /dashboard/profile/[id]/safe-zones
 * Permet aux parents de configurer les zones de sécurité pour chaque enfant
 */

interface SafeZonesPageProps {
  params: Promise<{ id: string }>;
}

export default async function SafeZonesPage({ params }: SafeZonesPageProps) {
  const { id: profileId } = await params;

  // Récupérer le profil depuis Firestore (Server Component)
  let profile: ProfileDocument | null = null;
  try {
    const profileSnap = await adminDb.collection('profiles').doc(profileId).get();
    if (profileSnap.exists) {
      profile = { ...profileSnap.data(), id: profileSnap.id } as ProfileDocument;
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        }
      >
        <SafeZonesClient profile={profile} />
      </Suspense>
    </div>
  );
}
