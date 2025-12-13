'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ScanDocument } from '@/types/scan';
import type { ProfileDocument } from '@/types/profile';
import { Button } from '@/components/ui/button';

/**
 * DASHBOARD - SCAN HISTORY DIALOG
 *
 * Affiche l'historique complet des scans d'un bracelet
 * - Date et heure de chaque scan
 * - Localisation approximative (ville/pays)
 * - Information appareil
 */

interface ScanHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileDocument;
}

export function ScanHistoryDialog({ isOpen, onClose, profile }: ScanHistoryDialogProps) {
  const [scans, setScans] = useState<ScanDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScans = async () => {
      if (!isOpen || !profile.currentBraceletId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Tenter avec orderBy (nécessite index Firestore)
        try {
          const scansQuery = query(
            collection(db, 'scans'),
            where('braceletId', '==', profile.currentBraceletId),
            orderBy('timestamp', 'desc')
          );

          const scansSnap = await getDocs(scansQuery);
          const scansData = scansSnap.docs.map((doc) => ({
            ...doc.data() as ScanDocument,
            id: doc.id,
          }));

          setScans(scansData);

          // Marquer tous les scans comme lus
          await markScansAsRead(scansSnap.docs);
        } catch (indexError: unknown) {
          // Fallback sans orderBy si l'index n'existe pas
          logger.warn('Index Firestore manquant, fallback sans orderBy:', indexError);

          const scansQuerySimple = query(
            collection(db, 'scans'),
            where('braceletId', '==', profile.currentBraceletId)
          );

          const scansSnap = await getDocs(scansQuerySimple);
          const scansData = scansSnap.docs
            .map((doc) => ({
              ...doc.data() as ScanDocument,
              id: doc.id,
            }))
            .sort((a, b) => {
              // Tri manuel en mémoire
              const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
              const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
              return timeB - timeA; // DESC
            });

          setScans(scansData);

          // Marquer tous les scans comme lus
          await markScansAsRead(scansSnap.docs);
        }
      } catch (err) {
        logger.error('Error loading scans:', err);
        setError('Impossible de charger l\'historique des scans');
      } finally {
        setLoading(false);
      }
    };

    // Fonction pour marquer les scans comme lus
    const markScansAsRead = async (scanDocs: Array<{ id: string }>) => {
      try {
        const batch = writeBatch(db);
        const unreadScans = scanDocs.filter((doc) => doc.data().isRead === false);

        if (unreadScans.length === 0) return;

        unreadScans.forEach((scanDoc) => {
          batch.update(doc(db, 'scans', scanDoc.id), { isRead: true });
        });

        await batch.commit();
      } catch (error) {
        logger.error('Error marking scans as read:', error);
      }
    };

    loadScans();
  }, [isOpen, profile.currentBraceletId]);

  const formatDate = (timestamp: unknown): string => {
    if (!timestamp) return 'Date inconnue';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return 'Date invalide';
    }
  };

  const formatLocation = (scan: ScanDocument): string => {
    if (scan.city && scan.country) {
      return `${scan.city}, ${scan.country}`;
    }
    if (scan.lat && scan.lng) {
      return `${scan.lat.toFixed(4)}°, ${scan.lng.toFixed(4)}°`;
    }
    return 'Localisation non disponible';
  };

  const getDeviceIcon = (deviceType?: string): string => {
    if (deviceType === 'mobile') return '📱';
    if (deviceType === 'tablet') return '📟';
    if (deviceType === 'desktop') return '💻';
    return '📱';
  };

  const getDeviceLabel = (scan: ScanDocument): string => {
    const parts = [];
    if (scan.deviceType) parts.push(scan.deviceType.charAt(0).toUpperCase() + scan.deviceType.slice(1));
    if (scan.os) parts.push(scan.os);
    if (scan.browser) parts.push(scan.browser);
    return parts.length > 0 ? parts.join(' • ') : 'Appareil inconnu';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-50 overflow-y-auto">
        <div className="min-h-full bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-6">
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Historique des Scans</h2>
                <p className="mt-1 text-slate-400">
                  {profile.fullName} - {scans.length} scan{scans.length > 1 ? 's' : ''} enregistré{scans.length > 1 ? 's' : ''}
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="rounded-full bg-slate-800/50 p-3 hover:bg-slate-700"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-orange" />
                  <p className="mt-4 text-slate-400">Chargement de l'historique...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : scans.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
                <Clock className="mx-auto h-16 w-16 text-slate-600" />
                <h3 className="mt-4 text-lg font-semibold text-white">Aucun scan enregistré</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Les scans du bracelet apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scans.map((scan) => (
                  <div
                    key={scan.id || `${scan.braceletId}-${scan.timestamp?.toMillis()}`}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Date et heure */}
                        <div className="flex items-center gap-2 text-white">
                          <Clock className="h-5 w-5 text-brand-orange" />
                          <span className="font-semibold">{formatDate(scan.timestamp)}</span>
                        </div>

                        {/* Localisation */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                          <MapPin className="h-4 w-4" />
                          <span>{formatLocation(scan)}</span>
                        </div>

                        {/* Appareil */}
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <span className="text-base">{getDeviceIcon(scan.deviceType)}</span>
                          <span>{getDeviceLabel(scan)}</span>
                        </div>

                        {/* Badge "Non lu" si applicable */}
                        {!scan.isRead && (
                          <div className="mt-2">
                            <span className="inline-block rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                              Nouveau
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Badge numéro */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-slate-400">
                        #{scans.length - index}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {!loading && !error && scans.length > 0 && (
              <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-center text-sm text-slate-400">
                  💡 Les scans sont enregistrés automatiquement lorsqu'un secouriste accède au profil
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
