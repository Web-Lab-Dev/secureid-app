'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
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
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthContext();
  const [hasPermission, setHasPermission] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

          // Afficher notification même si app ouverte
          if (Notification.permission === 'granted') {
            new Notification(payload.notification?.title || 'SecureID Alert', {
              body: payload.notification?.body || 'Nouvelle activité',
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
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

  return {
    hasPermission,
    token,
    requestPermission,
    loading,
  };
}
