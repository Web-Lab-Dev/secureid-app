'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, GraduationCap, Edit3, AlertCircle, History, MapPin, Heart, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getBraceletBadgeVariant, getBraceletStatusLabel } from '@/lib/bracelet-helpers';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProfileDocument } from '@/types/profile';
import type { BraceletDocument } from '@/types/bracelet';
import { reportBraceletLost, reactivateBracelet } from '@/actions/bracelet-actions';
import { useAuthContext } from '@/contexts/AuthContext';
import { PhotoModal } from '@/components/ui/PhotoModal';

/**
 * PHASE 9 - PROFILE CARD (Refactored)
 * PHASE 11 - Memoization pour éviter re-renders inutiles
 *
 * Carte d'affichage pour un profil enfant dans le dashboard
 * Features:
 * - Photo et nom de l'enfant (clickable pour éditer profil)
 * - Badge de statut du bracelet
 * - Toggle "Déclarer Perdu"
 * - 3 boutons d'action séparés:
 *   1. Modifier le Profil (edit public info + photo)
 *   2. Gérer Dossier Médical (confidential docs)
 *   3. Portail Scolaire (school pickup management)
 * - Memoization pour optimiser performance grilles
 */

interface ProfileCardProps {
  profile: ProfileDocument;
  bracelet: BraceletDocument | null;
  onStatusChange?: () => void;
  onEditProfile?: () => void;
  onManageMedical?: () => void;
  onManageSchool?: () => void;
  onViewScans?: () => void;
}

export const ProfileCard = memo(function ProfileCard({
  profile,
  bracelet,
  onStatusChange,
  onEditProfile,
  onManageMedical,
  onManageSchool,
  onViewScans
}: ProfileCardProps) {
  const { user } = useAuthContext();
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [localStatus, setLocalStatus] = useState(bracelet?.status || 'ACTIVE');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleToggleLost = async () => {
    if (!bracelet || !user) return;

    const toastId = toast.loading(
      localStatus === 'LOST'
        ? 'Réactivation du bracelet...'
        : 'Déclaration de perte...'
    );

    setIsTogglingStatus(true);

    try {
      // Mise à jour optimiste
      const newStatus = localStatus === 'LOST' ? 'ACTIVE' : 'LOST';
      setLocalStatus(newStatus);

      // Appeler l'action serveur
      const result = newStatus === 'LOST'
        ? await reportBraceletLost({ braceletId: bracelet.id, userId: user.uid })
        : await reactivateBracelet({ braceletId: bracelet.id, userId: user.uid });

      if (!result.success) {
        // Revert en cas d'erreur
        setLocalStatus(localStatus);
        toast.error(result.error || 'Erreur lors de la mise à jour', { id: toastId });
      } else {
        toast.success(
          newStatus === 'ACTIVE'
            ? 'Bracelet réactivé avec succès'
            : 'Bracelet déclaré perdu',
          { id: toastId }
        );
        // Notifier le parent pour rafraîchir
        onStatusChange?.();
      }
    } catch (error) {
      // Revert en cas d'erreur
      setLocalStatus(localStatus);
      logger.error('Error toggling bracelet status', { error, braceletId: bracelet?.id });
      toast.error('Une erreur est survenue', { id: toastId });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <Card
      variant="default"
      className="overflow-hidden transition-all hover:border-soft-pink/50 hover:shadow-xl hover:shadow-soft-pink/10 bg-gradient-to-br from-slate-800/90 to-slate-900/95 rounded-2xl border-2 border-slate-700/50"
    >
      <div className="p-6">
        {/* Header avec Photo - Clickable pour éditer profil */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Photo de profil - Clickable pour voir en grand */}
            <button
              onClick={() => profile.photoUrl && setIsPhotoModalOpen(true)}
              className={`relative h-28 w-28 overflow-hidden rounded-full border-4 transition-transform hover:scale-105 active:scale-95 ${localStatus === 'ACTIVE' ? 'border-soft-pink ring-4 ring-soft-pink/30 shadow-lg shadow-soft-pink/30 animate-soft-bounce' : 'border-slate-600 ring-2 ring-slate-700/50'}`}
              disabled={!profile.photoUrl}
              aria-label={profile.photoUrl ? `Voir la photo de ${profile.fullName} en grand` : `Pas de photo pour ${profile.fullName}`}
            >
              {profile.photoUrl ? (
                <Image
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                  sizes="112px"
                  priority={false}
                  quality={90}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800">
                  <User className="h-10 w-10 text-slate-500" />
                </div>
              )}
            </button>

            {/* Nom - Clickable pour éditer */}
            <button
              onClick={onEditProfile}
              className="text-left transition-opacity hover:opacity-80"
              aria-label={`Modifier le profil de ${profile.fullName}`}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{profile.fullName}</h3>
                <Edit3 className="h-3 w-3 text-slate-400" />
              </div>
              {bracelet && (
                <p className="text-xs text-slate-400 font-mono">
                  {bracelet.id}
                </p>
              )}
            </button>
          </div>

          {/* Badge Statut Bracelet */}
          {bracelet && (
            <Badge variant={getBraceletBadgeVariant(localStatus)}>
              {getBraceletStatusLabel(localStatus)}
            </Badge>
          )}
        </div>

        {/* Toggle Déclarer Perdu */}
        {bracelet && (bracelet.status === 'ACTIVE' || bracelet.status === 'LOST') && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-slate-300">Déclarer Perdu</span>
            </div>
            <button
              onClick={handleToggleLost}
              disabled={isTogglingStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 focus:ring-offset-slate-900 ${
                localStatus === 'LOST' ? 'bg-orange-500' : 'bg-slate-700'
              } ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={localStatus === 'LOST' ? 'Réactiver le bracelet' : 'Déclarer le bracelet perdu'}
              aria-checked={localStatus === 'LOST'}
              role="switch"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localStatus === 'LOST' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Boutons d'action - 5 sections séparées */}
        <div className="space-y-2">
          {/* Bouton 1: Suivi GPS - PHASE 15 - Design Émotionnel */}
          <Link
            href={`/dashboard/profile/${profile.id}/tracking`}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-orange to-brand-orange-dark px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand-orange/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MapPin className="h-4 w-4 group-hover:animate-breathe" />
            <span>Suivre en Temps Réel</span>
            <Heart className="ml-auto h-3 w-3 animate-heartbeat" />
          </Link>

          {/* Bouton 2: Modifier le Profil */}
          <Button onClick={onEditProfile} variant="secondary" size="sm" fullWidth className="hover:border-trust-blue transition-all">
            <Edit3 className="h-4 w-4" />
            Modifier le Profil
          </Button>

          {/* Bouton 3: Son Carnet de Santé - Design Apaisant Menthe */}
          <Button onClick={onManageMedical} variant="primary" size="sm" fullWidth className="bg-gradient-to-r from-health-mint to-health-teal hover:shadow-lg hover:shadow-health-mint/30 rounded-xl">
            <Shield className="h-4 w-4" />
            Son Carnet de Santé 🩺
          </Button>

          {/* Bouton 4: Portail Scolaire - Design Enfantin Bleu Ciel */}
          <Button onClick={onManageSchool} variant="primary" size="sm" fullWidth className="bg-gradient-to-r from-school-sky to-school-sky-dark hover:shadow-lg hover:shadow-school-sky/30 rounded-xl">
            <GraduationCap className="h-4 w-4" />
            Portail Scolaire 🏫
          </Button>

          {/* Bouton 5: Historique des Scans */}
          <Button onClick={onViewScans} variant="secondary" size="sm" fullWidth className="bg-slate-600 hover:bg-slate-500">
            <History className="h-4 w-4" />
            Historique des Scans
          </Button>
        </div>
      </div>

      {/* Photo Modal */}
      {profile.photoUrl && (
        <PhotoModal
          photoUrl={profile.photoUrl}
          childName={profile.fullName}
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
        />
      )}
    </Card>
  );
});
