'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { collection, query, orderBy, onSnapshot, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell, Clock, MapPin, Loader2, CheckCheck } from 'lucide-react';
import type { ScanDocument } from '@/types/scan';
import type { ProfileDocument } from '@/types/profile';

/**
 * PAGE NOTIFICATIONS CENTRALISÉE
 *
 * Affiche TOUS les scans de TOUS les enfants du parent
 * avec possibilité de marquer individuellement comme lu
 */

interface ScanWithProfile extends ScanDocument {
  scanId: string;
  profile: ProfileDocument | null;
}

export function NotificationsPageClient() {
  const { user } = useAuthContext();
  const { profiles } = useProfiles();
  const [scans, setScans] = useState<ScanWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    if (!user || !profiles || profiles.length === 0) {
      setLoading(false);
      return;
    }

    // Récupérer tous les braceletIds des enfants
    const braceletIds = profiles
      .map((p) => p.currentBraceletId)
      .filter((id): id is string => id !== null);

    if (braceletIds.length === 0) {
      setLoading(false);
      return;
    }

    // Query pour TOUS les scans de TOUS les enfants
    const scansQuery = query(
      collection(db, 'scans'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(scansQuery, (snapshot) => {
      const allScans: ScanWithProfile[] = [];

      snapshot.forEach((docSnap) => {
        const scanData = docSnap.data() as ScanDocument;

        // Filtrer uniquement les scans des bracelets du parent
        if (braceletIds.includes(scanData.braceletId)) {
          // Trouver le profil correspondant
          const matchingProfile = profiles.find(
            (p) => p.currentBraceletId === scanData.braceletId
          );

          allScans.push({
            ...scanData,
            scanId: docSnap.id,
            profile: matchingProfile || null,
          });
        }
      });

      setScans(allScans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profiles]);

  const markAsRead = async (scanId: string) => {
    try {
      await updateDoc(doc(db, 'scans', scanId), { isRead: true });
    } catch (error) {
      console.error('Error marking scan as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      const unreadScans = scans.filter((s) => !s.isRead);

      unreadScans.forEach((scan) => {
        batch.update(doc(db, 'scans', scan.scanId), { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

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

  const filteredScans = filter === 'unread' ? scans.filter((s) => !s.isRead) : scans;
  const unreadCount = scans.filter((s) => !s.isRead).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-orange" />
          <p className="mt-4 text-slate-400">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="mt-2 text-slate-400">
            {unreadCount > 0 ? `${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''} scan${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Filtres */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-1">
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === 'unread' ? 'bg-brand-orange text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Non lus ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-brand-orange text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({scans.length})
            </button>
          </div>

          {/* Marquer tout comme lu */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-600"
            >
              <CheckCheck className="h-4 w-4" />
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Liste des scans */}
      {filteredScans.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Bell className="mx-auto h-16 w-16 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            {filter === 'unread' ? 'Aucune nouvelle notification' : 'Aucun scan enregistré'}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {filter === 'unread'
              ? 'Tous les scans ont été consultés'
              : 'Les scans des bracelets apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => (
            <div
              key={scan.scanId}
              className={`rounded-lg border p-5 transition-all ${
                scan.isRead
                  ? 'border-slate-800 bg-slate-900/30'
                  : 'border-brand-orange/30 bg-slate-900/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Nom de l'enfant */}
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {scan.profile?.fullName || 'Profil inconnu'}
                    </h3>
                    {!scan.isRead && (
                      <span className="inline-block rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                        Nouveau
                      </span>
                    )}
                  </div>

                  {/* Date et heure */}
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="h-4 w-4 text-brand-orange" />
                    <span className="text-sm">{formatDate(scan.timestamp)}</span>
                  </div>

                  {/* Localisation */}
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {scan.city && scan.country
                        ? `${scan.city}, ${scan.country}`
                        : scan.lat && scan.lng
                        ? `${scan.lat.toFixed(4)}°, ${scan.lng.toFixed(4)}°`
                        : 'Localisation non disponible'}
                    </span>
                  </div>

                  {/* Appareil */}
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-base">{getDeviceIcon(scan.deviceType)}</span>
                    <span>{getDeviceLabel(scan)}</span>
                  </div>
                </div>

                {/* Action */}
                {!scan.isRead && (
                  <button
                    onClick={() => markAsRead(scan.scanId)}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-white transition-colors hover:bg-slate-600"
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
