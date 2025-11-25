'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * PHASE 3B - PAGE D'ACTIVATION (CLIENT COMPONENT)
 *
 * Composant client pour la page d'activation
 * Gère l'affichage des formulaires d'authentification
 */

interface ActivatePageClientProps {
  braceletId: string;
  token: string;
}

export function ActivatePageClient({ braceletId, token }: ActivatePageClientProps) {
  const { user } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);

  // Si l'utilisateur est connecté, afficher la suite (Phase 3C)
  if (user) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-8">
            <Shield className="w-16 h-16 text-tactical-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Compte connecté !</h2>
            <p className="text-gray-400 mb-6">
              Bonjour <span className="text-white font-semibold">{user.displayName}</span>
            </p>

            <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-brand-orange font-semibold mb-1">
                Bracelet détecté: <span className="font-mono">{braceletId}</span>
              </p>
              <p className="text-xs text-gray-400">
                Token: {token.substring(0, 4)}****
              </p>
            </div>

            <div className="bg-tactical-green/10 border border-tactical-green/30 rounded-lg p-4">
              <p className="text-sm text-tactical-green font-semibold mb-1">
                ✅ Phase 3B Complétée!
              </p>
              <p className="text-xs text-gray-400">
                L&apos;authentification fonctionne. La sélection de profil sera implémentée en Phase 3C.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher inscription ou connexion
  return (
    <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-orange/10 mb-4">
            <Shield className="w-12 h-12 text-brand-orange" strokeWidth={2} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Activation de Bracelet
          </h1>
          <p className="text-gray-400 mb-4">
            Bracelet: <span className="text-white font-mono">{braceletId}</span>
          </p>
        </div>

        {/* Formulaires */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 md:p-8">
          {showLogin ? (
            <LoginForm
              onSuccess={() => {
                // L'utilisateur est maintenant connecté, le composant va se re-render
              }}
              onSwitchToSignup={() => setShowLogin(false)}
            />
          ) : (
            <SignupForm
              onSuccess={() => {
                // L'utilisateur est maintenant connecté, le composant va se re-render
              }}
              onSwitchToLogin={() => setShowLogin(true)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>SecureID - Système de Protection pour Enfants</p>
        </div>
      </div>
    </div>
  );
}
