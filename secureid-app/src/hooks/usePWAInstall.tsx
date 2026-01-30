'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * PWA Install Context
 *
 * Capture l'événement beforeinstallprompt globalement pour:
 * 1. Empêcher la mini-barre native Chrome sur toutes les pages
 * 2. Permettre l'affichage du prompt uniquement sur le dashboard
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
  triggerInstall: () => Promise<boolean>;
  dismissInstall: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | null>(null);

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si déjà installé
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - iOS specific property
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Détecter iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      setIsInstallable(true);
    }

    // Capturer beforeinstallprompt GLOBALEMENT pour empêcher la mini-barre native
    const handleBeforeInstallPrompt = (e: Event) => {
      // IMPORTANT: Empêche la mini-barre native de Chrome
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        return true;
      }
    } catch (error) {
      console.error('PWA install error:', error);
    }

    return false;
  };

  const dismissInstall = () => {
    localStorage.setItem('pwa-banner-dismissed', 'true');
    setIsInstallable(false);
  };

  return (
    <PWAInstallContext.Provider
      value={{
        deferredPrompt,
        isInstallable,
        isIOS,
        isInstalled,
        triggerInstall,
        dismissInstall,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  if (!context) {
    throw new Error('usePWAInstall must be used within PWAInstallProvider');
  }
  return context;
}
