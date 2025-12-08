'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, Bell, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { LogoutConfirmDialog } from '@/components/auth/LogoutConfirmDialog';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * PHASE 4 - NAVIGATION DASHBOARD
 * PHASE 9 - Ajout de la confirmation de déconnexion
 *
 * Barre de navigation pour le dashboard parent
 * Affiche : Accueil, Mon Compte, Déconnexion
 */

export function DashboardNav() {
  const { user, userData, signOut } = useAuthContext();
  const router = useRouter();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadScansCount, setUnreadScansCount] = useState(0);

  // Écouter les scans non lus en temps réel
  useEffect(() => {
    if (!user) return;

    // Query pour compter les scans non lus
    const scansQuery = query(
      collection(db, 'scans'),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(scansQuery, (snapshot) => {
      setUnreadScansCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

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

            <Link
              href="/dashboard/notifications"
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              {unreadScansCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadScansCount > 99 ? '99+' : unreadScansCount}
                </span>
              )}
            </Link>

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
    </nav>
  );
}
