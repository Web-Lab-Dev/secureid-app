'use client';

import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Smartphone, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ScanDocument } from '@/types/scan';
import type { ProfileDocument } from '@/types/profile';

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

        const scansQuery = query(
          collection(db, 'scans'),
          where('braceletId', '==', profile.currentBraceletId),
          orderBy('timestamp', 'desc')
        );

        const scansSnap = await getDocs(scansQuery);
        const scansData = scansSnap.docs.map((doc) => doc.data() as ScanDocument);

        setScans(scansData);
      } catch (err) {
        console.error('Error loading scans:', err);
        setError('Impossible de charger l\'historique des scans');
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, [isOpen, profile.currentBraceletId]);

  const formatDate = (timestamp: any): string => {
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

  const formatLocation = (lat: number | null, lng: number | null): string => {
    if (!lat || !lng) return 'Localisation non disponible';
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  };

  const extractDeviceInfo = (userAgent: string): string => {
    // Extraction simplifiée de l'info navigateur/OS
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'Mac';
    return 'Appareil inconnu';
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
              <button
                onClick={onClose}
                className="rounded-full bg-slate-800/50 p-3 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
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
                {scans.map((scan, index) => (
                  <div
                    key={index}
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
                          <span>{formatLocation(scan.lat, scan.lng)}</span>
                        </div>

                        {/* Appareil */}
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Smartphone className="h-4 w-4" />
                          <span>{extractDeviceInfo(scan.userAgent)}</span>
                        </div>
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
