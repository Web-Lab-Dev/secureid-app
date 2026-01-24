'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, Bell, LogOut, Shield, Clock, MapPin, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { LogoutConfirmDialog } from '@/components/auth/LogoutConfirmDialog';
import { logger } from '@/lib/logger';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useProfiles } from '@/hooks/useProfiles';
import { APP_CONFIG } from '@/lib/config';
import { getRecentScans } from '@/actions/bracelet-actions';

/**
 * PHASE 4 - NAVIGATION DASHBOARD
 * PHASE 9 - Ajout de la confirmation de déconnexion
 * MIGRATION: onSnapshot -> Server Action pour éviter erreurs permissions
 *
 * Barre de navigation pour le dashboard parent
 * Affiche : Accueil, Mon Compte, Déconnexion
 */

interface ScanWithProfile {
  scanId: string;
  braceletId: string;
  timestamp: string;
  lat: number | null;
  lng: number | null;
  userAgent: string;
  isRead?: boolean;
  childName?: string;
}

export function DashboardNav() {
  const { user, userData, signOut } = useAuthContext();
  const router = useRouter();
  const { profiles } = useProfiles();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadScansCount, setUnreadScansCount] = useState(0);
  const [displayedScans, setDisplayedScans] = useState<ScanWithProfile[]>([]); // Scans affichés dans le modal
  const [unreadScanIds, setUnreadScanIds] = useState<string[]>([]); // IDs des scans non lus (pour le batch update)
  const isMarkingAsReadRef = useRef(false); // Flag ref pour éviter écrasement par onSnapshot

  // Charger les scans récents via Server Action (évite erreurs permissions avec onSnapshot)
  useEffect(() => {
    if (!user || !profiles || profiles.length === 0) {
      setDisplayedScans([]);
      setUnreadScansCount(0);
      setUnreadScanIds([]);
      return;
    }

    const profileIds = profiles.map((p) => p.id).filter((id): id is string => !!id);

    if (profileIds.length === 0) {
      setDisplayedScans([]);
      setUnreadScansCount(0);
      setUnreadScanIds([]);
      return;
    }

    const loadScans = async () => {
      try {
        const result = await getRecentScans({
          profileIds,
          userId: user.uid,
        });

        if (result.success && result.scans) {
          setDisplayedScans(result.scans);

          // Ne pas écraser les compteurs si on est en train de marquer comme lu
          if (!isMarkingAsReadRef.current) {
            const unreadIds = result.scans
              .filter((scan) => scan.isRead !== true)
              .map((scan) => scan.scanId);

            setUnreadScanIds(unreadIds);
            setUnreadScansCount(result.unreadCount || 0);
          }
        }
      } catch (error) {
        logger.error('Error loading scans', { error });
      }
    };

    loadScans();

    // Polling toutes les 30 secondes pour rafraîchir les scans
    const interval = setInterval(loadScans, 30000);

    return () => clearInterval(interval);
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
      logger.error('Logout failed', error);
      setIsLoggingOut(false);
    }
  };

  // Ouvrir le modal de notifications
  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
  };

  // Fermer le modal et marquer tous les scans comme lus
  const handleCloseNotifications = async () => {
    // Fermer immédiatement pour UX rapide
    setIsNotificationsOpen(false);

    // Marquer tous les scans affichés comme lus
    if (unreadScanIds.length > 0) {
      const idsToMark = [...unreadScanIds]; // Copie pour éviter la modification pendant l'async

      // 1. Mise à jour optimiste locale IMMÉDIATE
      setDisplayedScans((prevScans) =>
        prevScans.map((scan) =>
          idsToMark.includes(scan.scanId) ? { ...scan, isRead: true } : scan
        )
      );
      setUnreadScansCount(0);
      setUnreadScanIds([]);

      // 2. Bloquer temporairement le listener pendant la mise à jour Firestore
      isMarkingAsReadRef.current = true;

      // 3. Mise à jour Firestore en arrière-plan
      try {
        const batch = writeBatch(db);

        idsToMark.forEach((scanId) => {
          batch.update(doc(db, 'scans', scanId), { isRead: true });
        });

        await batch.commit();

        // 4. Attendre la propagation Firestore
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error('Failed to mark scans as read', error);
        // En cas d'erreur, le listener onSnapshot rétablira l'état correct
      } finally {
        // 5. Débloquer le listener maintenant que Firestore est à jour
        isMarkingAsReadRef.current = false;
      }
    }
  };

  const formatDate = (timestamp: string | null | undefined): string => {
    if (!timestamp) return 'Date invalide';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Date invalide';
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatLocation = (scan: ScanWithProfile): string => {
    if (scan.lat && scan.lng) {
      return `${scan.lat.toFixed(4)}°, ${scan.lng.toFixed(4)}°`;
    }
    return 'Localisation non disponible';
  };

  const getDeviceLabel = (scan: ScanWithProfile): string => {
    // Extraire info basique du user agent
    if (scan.userAgent.includes('Mobile')) return 'Mobile';
    if (scan.userAgent.includes('Tablet')) return 'Tablette';
    return 'Appareil';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
      {/* Safe area pour notch iOS/Android */}
      <div className="h-2 bg-slate-900/95" style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-brand-orange" />
              <span className="text-lg font-bold text-white">{APP_CONFIG.name}</span>
            </Link>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-brand-orange hover:text-brand-orange"
              title="Retour au site public"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Site public</span>
            </Link>
          </div>

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
              onClick={handleOpenNotifications}
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <NotificationBadge count={unreadScansCount} />
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
              {displayedScans.filter(scan => scan.isRead !== true).length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Bell className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedScans
                    .filter(scan => scan.isRead !== true)
                    .map((scan) => (
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
                        <span className="text-base">📱</span>
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
