import { SafeZonesClientWrapper } from './safe-zones-client-wrapper';

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

  return (
    <div className="min-h-screen bg-brand-black">
      <SafeZonesClientWrapper profileId={profileId} />
    </div>
  );
}
