'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { GraduationCap, Plus, Trash2, Lock, Calendar, User, X } from 'lucide-react';
import Image from 'next/image';
import type { ProfileDocument, PickupDocument } from '@/types/profile';
import { usePickups } from '@/hooks/usePickups';
import { updateSchoolPin, deletePickup } from '@/actions/school-actions';
import { useAuthContext } from '@/contexts/AuthContext';
import { AddPickupDialog } from './AddPickupDialog';
import { Button } from '@/components/ui/button';

/**
 * PHASE 8 - SCHOOL SECTION
 *
 * Section de gestion des sorties d'école dans le dashboard parent
 * - Gestion du PIN école
 * - Liste des "Anges Gardiens" (récupérateurs autorisés)
 * - Ajout/Suppression de récupérateurs
 */

interface SchoolSectionProps {
  profile: ProfileDocument;
}

export function SchoolSection({ profile }: SchoolSectionProps) {
  const { user } = useAuthContext();
  const { pickups, loading } = usePickups(profile.id);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; name: string } | null>(null);

  const handleUpdatePin = async () => {
    if (!user) return;

    if (!/^\d{4}$/.test(newPin)) {
      setPinError('Le code doit contenir exactement 4 chiffres');
      return;
    }

    setPinLoading(true);
    setPinError('');

    try {
      const result = await updateSchoolPin({
        profileId: profile.id,
        newPin,
        parentId: user.uid,
      });

      if (result.success) {
        setIsEditingPin(false);
        setNewPin('');
      } else {
        setPinError(result.message || 'Erreur');
      }
    } catch (error) {
      setPinError('Une erreur est survenue');
    } finally {
      setPinLoading(false);
    }
  };

  const handleDeletePickup = async (pickupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce récupérateur ?')) {
      return;
    }

    try {
      await deletePickup({ profileId: profile.id, pickupId });
    } catch (error) {
      logger.error('Error deleting pickup:', error);
    }
  };

  // Vérifier si un pass est temporaire et obtenir les infos
  const getExpirationBadge = (pickup: PickupDocument) => {
    if (pickup.type !== 'TEMPORARY' || !pickup.expiresAt) return null;

    // expiresAt peut être un Timestamp Firestore ou une string ISO (depuis server actions)
    const firebaseTimestamp = pickup.expiresAt as { toDate?: () => Date };
    const expiresDate = firebaseTimestamp.toDate ? firebaseTimestamp.toDate() : new Date(pickup.expiresAt as unknown as string);
    const now = new Date();
    const isExpired = expiresDate < now;
    const isToday = expiresDate.toDateString() === now.toDateString();

    if (isExpired) {
      return { color: 'red', text: 'EXPIRÉ', icon: Calendar };
    }

    if (isToday) {
      return { color: 'yellow', text: "AUJOURD'HUI", icon: Calendar };
    }

    return {
      color: 'blue',
      text: `Jusqu'au ${expiresDate.toLocaleDateString('fr-FR')}`,
      icon: Calendar,
    };
  };

  return (
    <div className="space-y-6">
      {/* Section PIN École - Design Enfantin */}
      <div className="rounded-2xl border-2 border-school-sky/30 bg-gradient-to-br from-school-bg/40 to-sky-950/30 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-school-yellow/20 p-3 animate-soft-bounce">
            <Lock className="h-6 w-6 text-school-yellow" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Code PIN École</h3>
            <p className="text-sm text-school-sky/80">
              Code à 4 chiffres pour le portail de contrôle des sorties
            </p>
          </div>
        </div>

        {profile.schoolPin && !isEditingPin ? (
          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl tracking-widest text-white">••••</span>
              <span className="text-sm text-green-400">✓ Code configuré</span>
            </div>
            <Button
              onClick={() => setIsEditingPin(true)}
              variant="link"
              size="sm"
              className="text-school-sky hover:text-school-sky/80"
            >
              Modifier
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="tel"
              inputMode="numeric"
              pattern="\d{4}"
              value={newPin}
              onChange={(e) => {
                if (/^\d{0,4}$/.test(e.target.value)) {
                  setNewPin(e.target.value);
                  setPinError('');
                }
              }}
              placeholder="Entrez 4 chiffres"
              className="w-full rounded-xl border-2 border-school-sky/30 bg-slate-800/80 px-4 py-3 text-center text-xl font-mono tracking-widest text-white placeholder-slate-500 focus:border-school-sky focus:outline-none focus:ring-2 focus:ring-school-sky/50"
            />
            {pinError && <p className="text-sm text-red-400">{pinError}</p>}
            <div className="flex gap-3">
              <Button
                onClick={handleUpdatePin}
                disabled={newPin.length !== 4 || pinLoading}
                variant="indigo"
                size="sm"
                className="flex-1"
              >
                {pinLoading ? 'Enregistrement...' : profile.schoolPin ? 'Mettre à jour' : 'Définir le code'}
              </Button>
              {isEditingPin && (
                <Button
                  onClick={() => {
                    setIsEditingPin(false);
                    setNewPin('');
                    setPinError('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Annuler
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section Récupérateurs - Design Enfantin */}
      <div className="rounded-2xl border-2 border-school-green/20 bg-gradient-to-br from-slate-900/80 to-school-bg/20 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-school-green/20 p-3 animate-float">
              <GraduationCap className="h-6 w-6 text-school-green" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Anges Gardiens 👼</h3>
              <p className="text-sm text-school-sky/70">
                Personnes autorisées à récupérer {profile.fullName}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            variant="indigo"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {/* Liste des récupérateurs */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-school-sky border-t-transparent" />
            <p className="mt-4 text-sm text-school-sky/70">Chargement...</p>
          </div>
        ) : pickups.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-school-sky/30 bg-school-bg/10 py-12 text-center">
            <User className="mx-auto h-12 w-12 text-school-sky/50" />
            <p className="mt-4 text-white/80">Aucun récupérateur configuré</p>
            <p className="mt-2 text-sm text-school-sky/60">
              Ajoutez les personnes autorisées à récupérer l'enfant à l'école
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pickups.map((pickup) => {
              const badge = getExpirationBadge(pickup);

              return (
                <div
                  key={pickup.id}
                  className="group relative overflow-hidden rounded-2xl border-2 border-school-sky/20 bg-gradient-to-br from-slate-800/80 to-school-bg/20 p-4 transition-all hover:border-school-sky/50 hover:shadow-lg hover:shadow-school-sky/10"
                >
                  {/* Badge type */}
                  {badge && (
                    <div className={`absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                      badge.color === 'red'
                        ? 'bg-red-500/20 text-red-400'
                        : badge.color === 'yellow'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      <badge.icon className="h-3 w-3" />
                      <span>{badge.text}</span>
                    </div>
                  )}

                  {/* Photo */}
                  <div
                    className="relative mx-auto mb-3 h-24 w-24 cursor-pointer overflow-hidden rounded-full border-3 border-school-sky/60 ring-4 ring-school-sky/20 transition-transform hover:scale-110"
                    onClick={() => setSelectedPhoto({ url: pickup.photoUrl, name: pickup.name })}
                    title="Cliquez pour agrandir"
                  >
                    <Image
                      src={pickup.photoUrl}
                      alt={pickup.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h4 className="font-semibold text-white">{pickup.name}</h4>
                    <p className="text-sm text-school-sky">{pickup.relation}</p>

                    {/* Type */}
                    {pickup.type === 'PERMANENT' && (
                      <span className="mt-2 inline-block rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400">
                        PERMANENT
                      </span>
                    )}
                  </div>

                  {/* Bouton Supprimer */}
                  <Button
                    onClick={() => handleDeletePickup(pickup.id)}
                    variant="danger"
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full p-2 opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog Ajout Récupérateur */}
      <AddPickupDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        profileId={profile.id}
      />

      {/* Modale Zoom Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Button
              onClick={() => setSelectedPhoto(null)}
              variant="ghost"
              size="icon"
              className="absolute -right-4 -top-4 rounded-full bg-slate-800 text-white hover:bg-slate-700"
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="relative h-[80vh] w-[80vw] overflow-hidden rounded-lg">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.name}
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <p className="mt-4 text-center text-lg font-semibold text-white">
              {selectedPhoto.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
