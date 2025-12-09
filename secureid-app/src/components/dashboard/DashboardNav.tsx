'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, Bell, LogOut, Shield, Clock, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { LogoutConfirmDialog } from '@/components/auth/LogoutConfirmDialog';
import { collection, query, where, onSnapshot, writeBatch, doc, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useProfiles } from '@/hooks/useProfiles';
import type { ScanDocument } from '@/types/scan';

/**
 * PHASE 4 - NAVIGATION DASHBOARD
 * PHASE 9 - Ajout de la confirmation de déconnexion
 *
 * Barre de navigation pour le dashboard parent
 * Affiche : Accueil, Mon Compte, Déconnexion
 */

interface ScanWithProfile extends ScanDocument {
  scanId: string;
  childName: string;
}

export function DashboardNav() {
  const { user, userData, signOut } = useAuthContext();
  const router = useRouter();
  const { profiles } = useProfiles();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadScansCount, setUnreadScansCount] = useState(0);
  const [allScans, setAllScans] = useState<ScanWithProfile[]>([]);

  // Écouter les scans non lus en temps réel
  useEffect(() => {
    if (!user || !profiles || profiles.length === 0) return;

    const braceletIds = profiles
      .map((p) => p.currentBraceletId)
      .filter((id): id is string => id !== null);

    if (braceletIds.length === 0) {
      setAllScans([]);
      setUnreadScansCount(0);
      return;
    }

    // IMPORTANT: Firestore limite le where('in') à 10 éléments max
    // Si un parent a plus de 10 enfants, il faudra paginer
    const scansQuery = query(
      collection(db, 'scans'),
      where('braceletId', 'in', braceletIds.slice(0, 10)),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(scansQuery, (snapshot) => {
      const scans: ScanWithProfile[] = [];

      snapshot.forEach((docSnap) => {
        const scanData = docSnap.data() as ScanDocument;

        const matchingProfile = profiles.find(
          (p) => p.currentBraceletId === scanData.braceletId
        );

        if (matchingProfile) {
          scans.push({
            ...scanData,
            scanId: docSnap.id,
            childName: matchingProfile.fullName,
          });
        }
      });

      // Trier par date décroissante
      scans.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });

      setAllScans(scans);
      setUnreadScansCount(scans.length);
    });

    return () => unsubscribe();
  }, [user, profiles]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // Fermer le dialog avant la redirection
      setIsLogoutDialogOpen(false);
      // Redirection forcée vers /login
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  // Marquer tous les scans comme lus quand le modal se ferme
  const handleCloseNotifications = async () => {
    // Fermer immédiatement le modal pour une meilleure UX
    setIsNotificationsOpen(false);

    if (allScans.length > 0) {
      try {
        const batch = writeBatch(db);

        allScans.forEach((scan) => {
          batch.update(doc(db, 'scans', scan.scanId), { isRead: true });
        });

        await batch.commit();
        console.log(`${allScans.length} scan(s) marqué(s) comme lu(s)`);
      } catch (error) {
        console.error('Error marking scans as read:', error);
      }
    }
  };

  const formatDate = (timestamp: Timestamp | null | undefined): string => {
    if (!timestamp || !timestamp.toDate) return 'Date invalide';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
      {/* Safe area pour notch iOS/Android */}
      <div className="h-2 bg-slate-900/95" style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-orange" />
            <span className="text-lg font-bold text-white">SecureID</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadScansCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadScansCount > 99 ? '99+' : unreadScansCount}
                </span>
              )}
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 border-l border-slate-700 pl-4">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-white">{userData?.displayName || 'Parent'}</p>
                <p className="text-xs text-slate-400">{userData?.phoneNumber}</p>
              </div>

              <button
                onClick={() => setIsLogoutDialogOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmation de déconnexion */}
      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleSignOut}
        loading={isLoggingOut}
      />

      {/* Modal Notifications */}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20"
          onClick={handleCloseNotifications}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-slate-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <h2 className="text-xl font-bold text-white">
                Notifications {unreadScansCount > 0 && `(${unreadScansCount})`}
              </h2>
              <button
                onClick={handleCloseNotifications}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Liste des scans */}
            <div className="max-h-[70vh] overflow-y-auto p-4">
              {allScans.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allScans.map((scan) => (
                    <div
                      key={scan.scanId}
                      className="rounded-lg border border-slate-800 bg-slate-800/50 p-4"
                    >
                      {/* Nom de l'enfant */}
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">{scan.childName}</h3>
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                          Nouveau
                        </span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Clock className="h-4 w-4 text-brand-orange" />
                        <span>{formatDate(scan.timestamp)}</span>
                      </div>

                      {/* Localisation */}
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        <MapPin className="h-4 w-4 text-brand-orange" />
                        <span>{formatLocation(scan)}</span>
                      </div>

                      {/* Appareil */}
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <span className="text-base">{getDeviceIcon(scan.deviceType)}</span>
                        <span>{getDeviceLabel(scan)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
