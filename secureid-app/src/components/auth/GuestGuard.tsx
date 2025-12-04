'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';

/**
 * PHASE 9 - GUEST GUARD
 *
 * Composant de protection pour les pages publiques (login, activate)
 * Redirige vers /dashboard si l'utilisateur est déjà connecté
 */

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est connecté, rediriger vers le dashboard
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Afficher le loader pendant la vérification
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 shadow-lg shadow-brand-orange/20 animate-pulse">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <p className="text-slate-400">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  // Si utilisateur connecté, ne rien afficher (redirection en cours)
  if (user) {
    return null;
  }

  // Utilisateur non connecté, afficher le contenu
  return <>{children}</>;
}
