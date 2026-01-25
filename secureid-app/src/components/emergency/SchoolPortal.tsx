'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, UserCheck, Clock, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import type { PickupDocument } from '@/types/profile';
import { getAuthorizedPickups } from '@/actions/school-actions';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';

/**
 * PHASE 8 - SCHOOL PORTAL
 *
 * Interface de contrôle visuel pour les sorties d'école
 * - Affiche les photos des récupérateurs autorisés
 * - Badge temporaire si pass avec expiration
 * - Design rassurant pour le vigile
 */

interface SchoolPortalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  childName: string;
}

export function SchoolPortal({ isOpen, onClose, profileId, childName }: SchoolPortalProps) {
  const [pickups, setPickups] = useState<PickupDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    if (isOpen && profileId) {
      loadPickups();
    }
  }, [isOpen, profileId]);

  const loadPickups = async () => {
    setLoading(true);
    try {
      const result = await getAuthorizedPickups({ profileId });
      if (result.success && result.pickups) {
        setPickups(result.pickups);
      }
    } catch (error) {
      logger.error('Error loading pickups', { error, profileId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Vérifier si un pass est temporaire et quand il expire
  const getExpirationInfo = (pickup: PickupDocument) => {
    if (pickup.type !== 'TEMPORARY' || !pickup.expiresAt) return null;

    // expiresAt peut être un Timestamp Firestore ou une string ISO (depuis server actions)
    let expiresDate: Date;
    if (typeof pickup.expiresAt === 'string') {
      expiresDate = new Date(pickup.expiresAt);
    } else if (pickup.expiresAt && typeof pickup.expiresAt === 'object' && 'toDate' in pickup.expiresAt) {
      expiresDate = pickup.expiresAt.toDate();
    } else {
      return null;
    }

    const now = new Date();
    const isToday = expiresDate.toDateString() === now.toDateString();

    return {
      isToday,
      date: expiresDate,
      text: isToday
        ? `Valide jusqu'à ${expiresDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
        : `Valide jusqu'au ${expiresDate.toLocaleDateString('fr-FR')}`,
    };
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Design Enfantin Bleu Ciel */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-50 overflow-y-auto">
        <div className="min-h-full bg-gradient-to-b from-school-bg to-slate-900 px-4 py-6">
          {/* Header */}
          <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-school-yellow/20 p-3 animate-float">
                <GraduationCap className="h-8 w-8 text-school-yellow" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Contrôle Sortie École 🏫
                </h1>
                <p className="mt-1 text-lg text-school-sky">
                  Qui est venu chercher <span className="font-semibold">{childName}</span> ?
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-slate-800/50 p-3 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-school-sky border-t-transparent" />
                <p className="mt-4 text-school-sky/70">Chargement...</p>
              </div>
            </div>
          ) : pickups.length === 0 ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="text-center">
                <UserCheck className="mx-auto h-16 w-16 text-school-sky/50" />
                <p className="mt-4 text-lg text-white/80">
                  Aucun récupérateur autorisé configuré
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pickups.map((pickup) => {
                const expirationInfo = getExpirationInfo(pickup);

                return (
                  <div
                    key={pickup.id}
                    className="group relative overflow-hidden rounded-3xl border-2 border-school-sky/30 bg-gradient-to-br from-slate-800/80 to-school-bg/30 p-6 shadow-2xl backdrop-blur-sm transition-all hover:border-school-sky hover:shadow-school-sky/30"
                  >
                    {/* Badge Temporaire */}
                    {pickup.type === 'TEMPORARY' && expirationInfo && (
                      <div className="absolute right-3 top-3 z-10">
                        <div className="flex items-center gap-1 rounded-full bg-yellow-500/90 px-3 py-1 text-xs font-bold text-yellow-950">
                          {expirationInfo.isToday ? (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>AUJOURD'HUI</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="h-3 w-3" />
                              <span>TEMPORAIRE</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Photo */}
                    <div
                      className="relative mx-auto mb-4 h-40 w-40 cursor-pointer overflow-hidden rounded-full border-4 border-school-sky ring-4 ring-school-sky/30 shadow-[0_0_30px_rgba(56,189,248,0.3)] transition-transform hover:scale-110"
                      onClick={() => setSelectedPhoto({ url: pickup.photoUrl, name: pickup.name })}
                      title="Cliquez pour agrandir"
                    >
                      <Image
                        src={pickup.photoUrl}
                        alt={pickup.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white">{pickup.name}</h3>
                      <p className="mt-1 text-sm font-medium text-school-sky">{pickup.relation}</p>

                      {/* Expiration */}
                      {expirationInfo && (
                        <div className="mt-3 rounded-lg bg-yellow-500/10 px-3 py-2">
                          <p className="text-xs text-yellow-400">{expirationInfo.text}</p>
                        </div>
                      )}

                      {/* Badge Permanent */}
                      {pickup.type === 'PERMANENT' && (
                        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                          <UserCheck className="h-3 w-3" />
                          <span>AUTORISÉ</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer info */}
          <div className="mx-auto mt-8 max-w-4xl rounded-2xl border-2 border-school-yellow/30 bg-school-bg/50 p-4 text-center">
            <p className="text-sm text-school-yellow">
              ⚠️ Vérifiez visuellement l'identité de la personne avant de confier l'enfant
            </p>
          </div>
        </div>
      </div>

      {/* Modale Zoom Photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
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
    </>
  );
}
