'use client';

import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { Download, X, Share, Plus, ChevronRight } from 'lucide-react';

/**
 * PWA INSTALL BANNER - Expérience Native Maximale
 *
 * - Android/Chrome: Utilise le prompt natif beforeinstallprompt
 * - iOS Safari: Affiche les instructions "Ajouter à l'écran d'accueil"
 * - Sticky en bas de l'écran avec animation
 * - Peut être fermée (stocké en localStorage)
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallMode = 'prompt' | 'ios' | 'none';

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installMode, setInstallMode] = useState<InstallMode>('none');
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé la bannière
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');

    // Vérifier si l'app est déjà installée (mode standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - iOS specific property
      window.navigator.standalone === true;

    if (bannerDismissed || isStandalone) {
      return;
    }

    // Détecter iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari) {
      setInstallMode('ios');
      setShowBanner(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallMode('prompt');
      setShowBanner(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setShowBanner(false);
      localStorage.setItem('pwa-banner-dismissed', 'installed');
      logger.info('PWA installée avec succès');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installMode === 'ios') {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        logger.info('PWA installée via prompt');
        localStorage.setItem('pwa-banner-dismissed', 'installed');
      }
    } catch (error) {
      logger.error('Erreur lors de l\'installation PWA:', error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', 'true');
    setShowBanner(false);
    setShowIOSInstructions(false);
  };

  // Ne pas afficher si pas nécessaire
  if (!showBanner) {
    return null;
  }

  // Instructions iOS détaillées
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-slate-900 p-6 pb-10 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Installer SecureID
            </h3>
            <button
              onClick={handleDismiss}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Étapes */}
          <div className="space-y-4">
            {/* Étape 1 */}
            <div className="flex items-start gap-4 rounded-xl bg-slate-800/50 p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  Appuyez sur le bouton Partager
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  En bas de l&apos;écran Safari
                </p>
              </div>
              <Share className="h-6 w-6 text-blue-500" />
            </div>

            {/* Étape 2 */}
            <div className="flex items-start gap-4 rounded-xl bg-slate-800/50 p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  Faites défiler et appuyez sur
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                  <Plus className="h-4 w-4" />
                  &quot;Sur l&apos;écran d&apos;accueil&quot;
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-slate-500" />
            </div>

            {/* Étape 3 */}
            <div className="flex items-start gap-4 rounded-xl bg-slate-800/50 p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  Appuyez sur &quot;Ajouter&quot;
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  L&apos;app apparaîtra sur votre écran d&apos;accueil
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-1.5">
                <img
                  src="/icon-96.png"
                  alt="SecureID"
                  className="h-full w-full rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Bouton Compris */}
          <button
            onClick={handleDismiss}
            className="mt-6 w-full rounded-xl bg-brand-orange py-3 font-semibold text-white transition-all hover:bg-brand-orange/90 active:scale-[0.98]"
          >
            J&apos;ai compris
          </button>
        </div>
      </div>
    );
  }

  // Bannière compacte (Android & iOS initial)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up safe-area-inset-bottom">
      <div className="mx-auto max-w-2xl p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-lg">
          {/* Icône App */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-1 shadow-lg shadow-orange-500/30">
              <img
                src="/icon-96.png"
                alt="SecureID"
                className="h-full w-full rounded-lg"
              />
            </div>
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              Installez SecureID
            </p>
            <p className="text-xs text-slate-400 truncate">
              {installMode === 'ios'
                ? 'Ajoutez à votre écran d\'accueil'
                : 'Accès rapide comme une vraie app'}
            </p>
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Installer</span>
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
