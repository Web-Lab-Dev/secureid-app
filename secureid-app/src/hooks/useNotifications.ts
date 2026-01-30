'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import app from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Hook pour gérer les notifications push
 * - Demande la permission
 * - Enregistre le token FCM dans Firestore
 * - Écoute les messages en premier plan
 * - Gère le badge sur l'icône de l'app (PWA)
 */

interface UseNotificationsReturn {
  /** Permission accordée */
  hasPermission: boolean;
  /** Token FCM */
  token: string | null;
  /** Demander la permission */
  requestPermission: () => Promise<void>;
  /** État de chargement */
  loading: boolean;
  /** Nombre de notifications non lues */
  unreadCount: number;
  /** Marquer toutes les notifications comme lues */
  clearBadge: () => Promise<void>;
  /** Réinitialiser les notifications (supprimer token et en générer un nouveau) */
  resetNotifications: () => Promise<{ success: boolean; newToken?: string; error?: string }>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthContext();
  const [hasPermission, setHasPermission] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Mettre à jour le badge de l'icône de l'app (PWA)
   * Utilise l'API Badging pour afficher un compteur sur l'icône
   */
  const updateAppBadge = async (count: number) => {
    try {
      if ('setAppBadge' in navigator) {
        if (count > 0) {
          await (navigator as Navigator & { setAppBadge: (count: number) => Promise<void> }).setAppBadge(count);
          logger.info('App badge updated', { count });
        } else {
          await (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge();
          logger.info('App badge cleared');
        }
      }
    } catch (error) {
      // L'API Badging peut échouer silencieusement sur certains navigateurs
      logger.debug('App badge API not available or failed', { error });
    }
  };

  /**
   * Effacer le badge et réinitialiser le compteur
   */
  const clearBadge = async () => {
    setUnreadCount(0);
    await updateAppBadge(0);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Vérifier si les notifications sont supportées
    if (typeof window === 'undefined' || !('Notification' in window)) {
      logger.warn('Notifications not supported in this browser');
      setLoading(false);
      return;
    }

    // Vérifier la permission actuelle
    const checkPermission = async () => {
      const permission = Notification.permission;

      if (permission === 'granted') {
        setHasPermission(true);
        await registerFCMToken();
      } else if (permission === 'denied') {
        setHasPermission(false);
        logger.info('Notification permission denied');
      }

      setLoading(false);
    };

    checkPermission();
  }, [user]);

  const registerFCMToken = async () => {
    if (!user) return;

    try {
      const messaging = getMessaging(app);

      // Enregistrer le service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        logger.info('Service worker registered', { scope: registration.scope });
      }

      // Obtenir le token FCM
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        logger.error('VAPID key not configured');
        return;
      }

      const currentToken = await getToken(messaging, { vapidKey });

      if (currentToken) {
        setToken(currentToken);
        logger.info('FCM token obtained', { userId: user.uid });

        // Sauvegarder le token dans Firestore (dans le document user)
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          fcmToken: currentToken,
          fcmTokenUpdatedAt: new Date(),
        });

        // Écouter les messages en premier plan (app ouverte)
        onMessage(messaging, (payload) => {
          logger.info('Foreground message received', { payload });

          // Incrémenter le compteur de notifications non lues
          setUnreadCount((prev) => {
            const newCount = prev + 1;
            // Mettre à jour le badge de l'app
            updateAppBadge(newCount);
            return newCount;
          });

          // Afficher notification même si app ouverte
          if (Notification.permission === 'granted') {
            new Notification(payload.notification?.title || 'SecureID Alert', {
              body: payload.notification?.body || 'Nouvelle activité',
              icon: '/icon-192.png',
              badge: '/icon-72.png',
              tag: 'secureid-scan',
            });
          }
        });

      } else {
        logger.warn('No FCM token available');
      }
    } catch (error) {
      logger.error('Error registering FCM token', { error });
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Les notifications ne sont pas supportées sur ce navigateur');
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setHasPermission(true);
        await registerFCMToken();
        logger.info('Notification permission granted');
      } else {
        setHasPermission(false);
        logger.warn('Notification permission denied');
      }
    } catch (error) {
      logger.error('Error requesting notification permission', { error });
    }
  };

  /**
   * Réinitialiser complètement les notifications
   * - Supprime l'ancien token FCM
   * - Désinstalle l'ancien Service Worker
   * - Réinstalle un nouveau SW et génère un nouveau token
   */
  const resetNotifications = async (): Promise<{ success: boolean; newToken?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      logger.info('🔄 Resetting notifications...');

      // 1. Supprimer l'ancien token FCM
      const messaging = getMessaging(app);
      try {
        await deleteToken(messaging);
        logger.info('✅ Old FCM token deleted');
      } catch (e) {
        logger.warn('Could not delete old token (might not exist)', { e });
      }

      // 2. Désinstaller tous les Service Workers FCM
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            await registration.unregister();
            logger.info('✅ Old Service Worker unregistered');
          }
        }
      }

      // 3. Attendre un peu pour que tout soit nettoyé
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Réenregistrer le Service Worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          updateViaCache: 'none' // Force le téléchargement du nouveau SW
        });
        logger.info('✅ New Service Worker registered', { scope: registration.scope });

        // Attendre que le SW soit actif
        await navigator.serviceWorker.ready;
      }

      // 5. Obtenir un nouveau token FCM
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        return { success: false, error: 'VAPID key non configurée' };
      }

      const newToken = await getToken(messaging, { vapidKey });

      if (newToken) {
        setToken(newToken);
        logger.info('✅ New FCM token obtained', { tokenPreview: newToken.substring(0, 20) + '...' });

        // 6. Sauvegarder dans Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          fcmToken: newToken,
          fcmTokenUpdatedAt: new Date(),
        });
        logger.info('✅ New token saved to Firestore');

        return { success: true, newToken: newToken.substring(0, 30) + '...' };
      } else {
        return { success: false, error: 'Impossible de générer un nouveau token' };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('❌ Reset notifications failed', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  return {
    hasPermission,
    token,
    requestPermission,
    loading,
    unreadCount,
    clearBadge,
    resetNotifications,
  };
}
