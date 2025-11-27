import { ProfileDetailClient } from './page-client';

/**
 * PHASE 4B - PAGE DÉTAIL PROFIL (SERVER COMPONENT)
 *
 * Page de gestion complète d'un profil enfant
 * - Section A: Infos publiques (groupe sanguin, allergies, contacts)
 * - Section B: Zone confidentielle (documents, PIN médecin)
 *
 * Route: /dashboard/profile/[id]
 * Protection: AuthGuard dans dashboard/layout.tsx
 */

interface ProfileDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfileDetailPage({ params }: ProfileDetailPageProps) {
  const { id } = await params;

  return <ProfileDetailClient profileId={id} />;
}
