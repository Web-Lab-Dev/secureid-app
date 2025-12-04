'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

/**
 * PHASE 7 - PWA INSTALL BANNER
 *
 * Bannière d'invitation à installer l'application PWA
 * - Apparaît uniquement si le navigateur supporte l'installation
 * - Sticky en bas du Dashboard
 * - Peut être fermée (stocké en localStorage)
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé la bannière
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');

    // Vérifier si l'app est déjà installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (bannerDismissed || isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher le prompt natif automatique
      e.preventDefault();

      // Stocker l'événement pour l'utiliser plus tard
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem('pwa-banner-dismissed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Afficher le prompt d'installation natif
      await deferredPrompt.prompt();

      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA installée avec succès');
        setIsInstalled(true);
        localStorage.setItem('pwa-banner-dismissed', 'true');
      }

      // Ne pas cacher la bannière si refusé, garder visible pour réessayer
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error);
    }
  };

  const handleDismiss = () => {
    // Sauvegarder la préférence de l'utilisateur
    localStorage.setItem('pwa-banner-dismissed', 'true');
    setShowBanner(false);
  };

  // Ne pas afficher si l'app est installée ou la bannière fermée
  if (!showBanner || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-auto max-w-2xl p-4">
        <div className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-lg">
          {/* Icône */}
          <div className="flex-shrink-0">
            <div className="rounded-full bg-orange-500/20 p-2">
              <Download className="h-6 w-6 text-orange-500" />
            </div>
          </div>

          {/* Texte */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              Installez l'application SecureID
            </p>
            <p className="text-xs text-slate-400">
              Accès rapide depuis votre écran d'accueil
            </p>
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
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
