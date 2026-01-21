'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ProfileDocument } from '@/types/profile';
import type { MedicalFormData } from '@/schemas/activation';
import { createProfile } from '@/actions/profile-actions';
import { linkBraceletToProfile, transferBracelet, validateBraceletToken } from '@/actions/bracelet-actions';

// Import direct (pas de lazy loading) pour debug
import { SignupForm } from '@/components/auth/SignupForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { ProfileSelector } from '@/components/activation/ProfileSelector';
import { MedicalForm } from '@/components/activation/MedicalForm';
import { ActivationSuccess } from '@/components/activation/ActivationSuccess';

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

type ActivationStep = 'auth' | 'select-profile' | 'new-profile' | 'transfer-profile' | 'success';

export function ActivatePageClient({ braceletId, token }: ActivatePageClientProps) {
  const { user, userData } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  const [step, setStep] = useState<ActivationStep>('auth');
  const [selectedProfile, setSelectedProfile] = useState<ProfileDocument | null>(null);
  const [createdProfileName, setCreatedProfileName] = useState<string>('');
  const [activationMode, setActivationMode] = useState<'new' | 'transfer'>('new');
  const [error, setError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Éviter hydration mismatch : n'afficher le bandeau qu'après montage client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Valider le token au chargement
  useEffect(() => {
    const validateToken = async () => {
      try {
        setValidatingToken(true);
        const result = await validateBraceletToken({ braceletId, token });

        if (result.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError(result.error || 'Token invalide');
        }
      } catch (_err) {
        setTokenValid(false);
        setError('Erreur lors de la validation du bracelet');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [braceletId, token]);

  // Dériver l'étape actuelle de l'état user sans useEffect
  // Évite les boucles infinies de re-render causées par setStep dans useEffect
  const currentStep = user && step === 'auth' ? 'select-profile' : step;

  // Version indicator pour debug - à supprimer après validation
  useEffect(() => {
    console.log('✅ Version FIX déployée - commit 9d1c306');
  }, []);

  // Callbacks mémorisés pour éviter les re-renders inutiles
  const handleNewProfile = useCallback(() => {
    setActivationMode('new');
    setStep('new-profile');
    setError(null);
  }, []);

  const handleSelectProfile = useCallback((profile: ProfileDocument) => {
    setSelectedProfile(profile);
    setActivationMode('transfer');
    setStep('transfer-profile');
    setError(null);
  }, []);

  const handleBackToSelection = useCallback(() => {
    setStep('select-profile');
    setSelectedProfile(null);
    setError(null);
  }, []);

  const handleBackToSelectionSimple = useCallback(() => {
    setStep('select-profile');
    setError(null);
  }, []);

  // Handler pour création de nouveau profil + liaison bracelet
  const handleCreateProfile = useCallback(async (formData: MedicalFormData) => {
    if (!user) return;

    try {
      setError(null);

      // Étape 1: Créer le profil
      const profileResult = await createProfile({
        formData,
        parentId: user.uid,
      });

      if (!profileResult.success || !profileResult.profileId) {
        throw new Error(profileResult.error || 'Erreur lors de la création du profil');
      }

      // Étape 2: Lier le bracelet au profil
      const linkResult = await linkBraceletToProfile({
        braceletId,
        profileId: profileResult.profileId,
        token,
        userId: user.uid,
      });

      if (!linkResult.success) {
        throw new Error(linkResult.error || 'Erreur lors de la liaison du bracelet');
      }

      // Succès! Passer à l'écran de confirmation
      setCreatedProfileName(formData.fullName);
      setStep('success');
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : 'Une erreur est survenue');
    }
  }, [user, braceletId, token]);

  // Handler pour transfert de bracelet
  const handleTransferBracelet = useCallback(async () => {
    if (!user || !selectedProfile || !selectedProfile.currentBraceletId) return;

    try {
      setError(null);

      const transferResult = await transferBracelet({
        oldBraceletId: selectedProfile.currentBraceletId,
        newBraceletId: braceletId,
        profileId: selectedProfile.id,
        newBraceletToken: token,
        userId: user.uid,
      });

      if (!transferResult.success) {
        throw new Error(transferResult.error || 'Erreur lors du transfert');
      }

      // Succès! Passer à l'écran de confirmation
      setCreatedProfileName(selectedProfile.fullName);
      setStep('success');
    } catch (_err) {
      setError(_err instanceof Error ? _err.message : 'Une erreur est survenue');
    }
  }, [user, selectedProfile, braceletId, token]);

  // Afficher le loader pendant la validation du token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-orange animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Validation du bracelet...</p>
        </div>
      </div>
    );
  }

  // Si le token n'est pas valide, afficher l'erreur
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-500 mb-4">⚠️ Bracelet invalide</h1>
            <p className="text-gray-300 mb-2">{error || 'Ce bracelet ne peut pas être activé.'}</p>
            <p className="text-sm text-gray-500">
              Bracelet: <span className="font-mono text-white">{braceletId}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, gérer les étapes d'activation
  if (user) {
    // ÉTAPE: Sélection profil
    if (currentStep === 'select-profile') {
      return (
        <div className="min-h-screen bg-brand-black text-white overflow-x-hidden">
          {/* Debug indicator - visible sur mobile */}
          <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white text-xs px-3 py-1 rounded-full opacity-50">
            v9d1c306
          </div>

          {/* Bandeau bracelet détecté - Affiché uniquement après hydration pour éviter mismatch */}
          {mounted && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-green-900/95 backdrop-blur-sm border-b border-green-500/30 py-3 shadow-lg">
              <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 justify-center">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="text-center sm:text-left">
                    <p className="text-green-400 font-semibold text-sm sm:text-base">
                      Bracelet détecté : <span className="font-mono">{braceletId}</span>
                    </p>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      Choisissez un profil sans bracelet ou créez un nouveau profil
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="min-h-screen flex items-start justify-center p-4 pt-24 pb-8 w-full max-w-full">
            <ProfileSelector
              parentName={userData?.displayName}
              onNewProfile={handleNewProfile}
              onSelectProfile={handleSelectProfile}
            />
          </div>
        </div>
      );
    }

    // ÉTAPE: Nouveau profil (Phase 3D)
    if (currentStep === 'new-profile') {
      return (
        <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
          {/* Info bracelet en haut */}
          <div className="fixed top-4 right-4 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs z-10">
            <p className="text-gray-400">
              Bracelet: <span className="text-brand-orange font-mono">{braceletId}</span>
            </p>
          </div>

          <div className="w-full max-w-2xl py-8">
            {/* Bouton retour */}
            <button
              onClick={handleBackToSelectionSimple}
              className="mb-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
            >
              ← Retour à la sélection
            </button>

            {/* Message d'erreur global */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Formulaire médical */}
            <MedicalForm
              profileId={`temp_${Date.now()}`}
              onSubmit={handleCreateProfile}
              submitButtonText="Créer le profil et activer le bracelet"
            />
          </div>
        </div>
      );
    }

    // ÉTAPE: Transfert profil existant (Phase 3E)
    if (currentStep === 'transfer-profile' && selectedProfile) {
      return (
        <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-8">
              <Shield className="w-16 h-16 text-brand-orange mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-center">Confirmer le transfert</h2>
              <p className="text-gray-400 mb-6 text-center">
                Profil: <span className="font-semibold text-white">{selectedProfile.fullName}</span>
              </p>

              {/* Informations du transfert */}
              <div className="space-y-4 mb-6">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-gray-400 mb-1">Ancien bracelet</p>
                  <p className="text-lg font-mono text-red-400">
                    {selectedProfile.currentBraceletId || 'Aucun'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedProfile.currentBraceletId ? 'Sera désactivé' : ''}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 border border-brand-orange">
                  <p className="text-xs text-gray-400 mb-1">Nouveau bracelet</p>
                  <p className="text-lg font-mono text-brand-orange">{braceletId}</p>
                  <p className="text-xs text-green-500 mt-1">Sera activé</p>
                </div>
              </div>

              {/* Message d'avertissement */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-500">
                  ⚠️ Cette action est irréversible. L'ancien bracelet ne pourra plus être utilisé.
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-4">
                <button
                  onClick={handleBackToSelection}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  ← Annuler
                </button>
                <button
                  onClick={handleTransferBracelet}
                  className="flex-1 px-4 py-3 bg-brand-orange hover:bg-brand-orange/90 rounded-lg text-sm font-semibold transition-colors"
                >
                  Confirmer le transfert
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ÉTAPE: Succès
    if (currentStep === 'success') {
      return (
        <ActivationSuccess
          childName={createdProfileName}
          braceletId={braceletId}
          mode={activationMode}
        />
      );
    }

    // Si aucune condition ne correspond, ne rien afficher (évite l'erreur)
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
