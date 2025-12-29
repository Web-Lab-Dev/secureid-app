'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, FileHeart, GraduationCap, Edit3, AlertCircle, History, MapPin, Heart, Shield } from 'lucide-react';
import { logger } from '@/lib/logger';
import { getBraceletBadgeVariant, getBraceletStatusLabel } from '@/lib/bracelet-helpers';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProfileDocument } from '@/types/profile';
import type { BraceletDocument } from '@/types/bracelet';
import { reportBraceletLost, reactivateBracelet } from '@/actions/bracelet-actions';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * PHASE 9 - PROFILE CARD (Refactored)
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

export function ProfileCard({
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

  const handleToggleLost = async () => {
    if (!bracelet || !user) return;

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
        alert(result.error || 'Erreur lors de la mise à jour');
      } else {
        // Notifier le parent pour rafraîchir
        onStatusChange?.();
      }
    } catch (error) {
      // Revert en cas d'erreur
      setLocalStatus(localStatus);
      logger.error('Error toggling bracelet status', { error, braceletId: bracelet?.id });
      alert('Une erreur est survenue');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <Card
      variant="default"
      className="overflow-hidden transition-all hover:border-brand-orange hover:shadow-lg hover:shadow-brand-orange/10 bg-linear-to-br from-warm-gray to-brand-black"
    >
      <div className="p-6">
        {/* Header avec Photo - Clickable pour éditer profil */}
        <div className="mb-4 flex items-start justify-between">
          <button
            onClick={onEditProfile}
            className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
          >
            {/* Photo de profil */}
            <div className={`relative h-20 w-20 overflow-hidden rounded-full border-2 ${localStatus === 'ACTIVE' ? 'border-brand-orange animate-pulse shadow-lg shadow-brand-orange/50' : 'border-slate-700'}`}>
              {profile.photoUrl ? (
                <Image
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800">
                  <User className="h-8 w-8 text-slate-500" />
                </div>
              )}
            </div>

            {/* Nom - Clickable */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{profile.fullName}</h3>
                <Edit3 className="h-3 w-3 text-slate-400" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {bracelet?.id || 'Aucun bracelet'}
              </p>
            </div>
          </button>

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

          {/* Bouton 3: Son Carnet de Santé - Design Protecteur */}
          <Button onClick={onManageMedical} variant="primary" size="sm" fullWidth className="bg-linear-to-r from-trust-blue to-trust-blue-dark hover:shadow-trust-blue/20">
            <Shield className="h-4 w-4" />
            Son Carnet de Santé
          </Button>

          {/* Bouton 4: Portail Scolaire */}
          <Button onClick={onManageSchool} variant="indigo" size="sm" fullWidth>
            <GraduationCap className="h-4 w-4" />
            Portail Scolaire
          </Button>

          {/* Bouton 5: Historique des Scans */}
          <Button onClick={onViewScans} variant="secondary" size="sm" fullWidth className="bg-slate-600 hover:bg-slate-500">
            <History className="h-4 w-4" />
            Historique des Scans
          </Button>
        </div>
      </div>
    </Card>
  );
}
