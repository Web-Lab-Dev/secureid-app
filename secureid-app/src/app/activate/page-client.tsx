'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { SignupForm } from '@/components/auth/SignupForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { ProfileSelector } from '@/components/activation/ProfileSelector';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 3C - PAGE D'ACTIVATION (CLIENT COMPONENT)
 *
 * Composant client pour la page d'activation
 * Gère les étapes: Authentification → Sélection profil → (Phase 3D: Formulaire)
 */

interface ActivatePageClientProps {
  braceletId: string;
  token: string;
}

type ActivationStep = 'auth' | 'select-profile' | 'new-profile' | 'transfer-profile';

export function ActivatePageClient({ braceletId, token }: ActivatePageClientProps) {
  const { user, userData } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  const [step, setStep] = useState<ActivationStep>('auth');
  const [selectedProfile, setSelectedProfile] = useState<ProfileDocument | null>(null);

  // Si l'utilisateur est connecté, gérer les étapes d'activation
  if (user) {
    // ÉTAPE: Sélection profil
    if (step === 'select-profile') {
      return (
        <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
          {/* Info bracelet en haut */}
          <div className="fixed top-4 right-4 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs">
            <p className="text-gray-400">
              Bracelet: <span className="text-brand-orange font-mono">{braceletId}</span>
            </p>
          </div>

          <ProfileSelector
            parentName={userData?.displayName}
            onNewProfile={() => {
              setStep('new-profile');
            }}
            onSelectProfile={(profile) => {
              setSelectedProfile(profile);
              setStep('transfer-profile');
            }}
          />
        </div>
      );
    }

    // ÉTAPE: Nouveau profil (Phase 3D)
    if (step === 'new-profile') {
      return (
        <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-8">
              <Shield className="w-16 h-16 text-tactical-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Nouveau profil</h2>
              <p className="text-gray-400 mb-6">
                Bracelet: <span className="font-mono text-brand-orange">{braceletId}</span>
              </p>

              <div className="bg-tactical-green/10 border border-tactical-green/30 rounded-lg p-4">
                <p className="text-sm text-tactical-green font-semibold mb-1">
                  ✅ Phase 3C Complétée!
                </p>
                <p className="text-xs text-gray-400">
                  Le formulaire de création de profil sera implémenté en Phase 3D.
                </p>
              </div>

              <button
                onClick={() => setStep('select-profile')}
                className="mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ÉTAPE: Transfert profil existant (Phase 3E)
    if (step === 'transfer-profile' && selectedProfile) {
      return (
        <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center">
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-8">
              <Shield className="w-16 h-16 text-tactical-green mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Transfert de bracelet</h2>
              <p className="text-gray-400 mb-6">
                Profil sélectionné: <span className="font-semibold text-white">{selectedProfile.fullName}</span>
              </p>

              <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-brand-orange mb-2">
                  Nouveau bracelet: <span className="font-mono">{braceletId}</span>
                </p>
                {selectedProfile.currentBraceletId && (
                  <p className="text-xs text-yellow-500">
                    ⚠️ L&apos;ancien bracelet ({selectedProfile.currentBraceletId}) sera désactivé
                  </p>
                )}
              </div>

              <div className="bg-tactical-green/10 border border-tactical-green/30 rounded-lg p-4">
                <p className="text-sm text-tactical-green font-semibold mb-1">
                  ✅ Phase 3C Complétée!
                </p>
                <p className="text-xs text-gray-400">
                  La logique de transfert sera implémentée en Phase 3E.
                </p>
              </div>

              <button
                onClick={() => {
                  setStep('select-profile');
                  setSelectedProfile(null);
                }}
                className="mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Par défaut, afficher la sélection de profil
    setStep('select-profile');
    return null;
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
