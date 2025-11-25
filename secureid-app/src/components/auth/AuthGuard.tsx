'use client';

import { ReactNode } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * PHASE 3B - COMPOSANT AUTH GUARD
 *
 * Protège les routes qui nécessitent une authentification
 * Affiche un loader pendant la vérification, puis:
 * - Le contenu si l'utilisateur est connecté
 * - Le fallback (formulaire de connexion) sinon
 */

interface AuthGuardProps {
  /** Contenu à afficher si l'utilisateur est connecté */
  children: ReactNode;

  /** Contenu à afficher si l'utilisateur n'est pas connecté */
  fallback?: ReactNode;

  /** Si true, affiche children même si non connecté (inverse la logique) */
  requireGuest?: boolean;
}

export function AuthGuard({ children, fallback, requireGuest = false }: AuthGuardProps) {
  const { user, loading } = useAuthContext();

  // Pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-orange animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Vérification...</p>
        </div>
      </div>
    );
  }

  // Mode "guest only" (pour pages login/signup)
  if (requireGuest) {
    return user ? (fallback ?? null) : <>{children}</>;
  }

  // Mode normal (protection)
  return user ? <>{children}</> : (fallback ?? null);
}
