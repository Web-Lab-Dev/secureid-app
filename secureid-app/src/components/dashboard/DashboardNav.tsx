'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, User, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { LogoutConfirmDialog } from '@/components/auth/LogoutConfirmDialog';

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
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Mon Compte</span>
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
