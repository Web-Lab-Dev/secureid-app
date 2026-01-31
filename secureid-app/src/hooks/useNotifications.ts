'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import app from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Hook pour gérer les notifications push FCM
 *
 * Fonctionnalités:
 * - Demande de permission
 * - Enregistrement du token FCM dans Firestore
 * - Écoute des messages en premier plan
 * - Réinitialisation du token si nécessaire
 */

interface UseNotificationsReturn {
  hasPermission: boolean;
  token: string | null;
  loading: boolean;
  requestPermission: () => Promise<void>;
  resetNotifications: () => Promise<{ success: boolean; error?: string }>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthContext();
  const [hasPermission, setHasPermission] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Enregistre le Service Worker et obtient le token FCM
   */
  const registerFCM = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      // 1. Enregistrer le Service Worker
      let swRegistration: ServiceWorkerRegistration | undefined;

      if ('serviceWorker' in navigator) {
        // Forcer la mise à jour du SW
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          updateViaCache: 'none'
        });

        // Attendre que le SW soit prêt
        await navigator.serviceWorker.ready;
        logger.info('Service Worker prêt', { scope: swRegistration.scope });
      }

      // 2. Obtenir le token FCM
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        logger.error('VAPID key non configurée');
        return null;
      }

      const messaging = getMessaging(app);
      const fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration
      });

      if (!fcmToken) {
        logger.warn('Impossible d\'obtenir le token FCM');
        return null;
      }

      logger.info('Token FCM obtenu', { preview: fcmToken.substring(0, 20) + '...' });

      // 3. Sauvegarder dans Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fcmToken,
        fcmTokenUpdatedAt: new Date()
      });

      // 4. Configurer le handler pour les messages en premier plan
      onMessage(messaging, (payload) => {
        logger.info('Message reçu en premier plan', { payload });

        // Afficher une notification même si l'app est ouverte
        if (Notification.permission === 'granted' && payload.notification) {
          const { title, body } = payload.notification;
          new Notification(title || 'SecureID', {
            body: body || 'Nouvelle notification',
            icon: '/icon-192.png',
            badge: '/icon-72.png',
            tag: 'secureid-foreground',
            requireInteraction: true
          });
        }
      });

      return fcmToken;

    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement FCM', { error });
      return null;
    }
  }, [user]);

  /**
   * Initialisation au montage
   */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Vérifier le support des notifications
    if (typeof window === 'undefined' || !('Notification' in window)) {
      logger.warn('Notifications non supportées');
      setLoading(false);
      return;
    }

    const init = async () => {
      const permission = Notification.permission;

      if (permission === 'granted') {
        setHasPermission(true);
        const fcmToken = await registerFCM();
        setToken(fcmToken);
      } else if (permission === 'denied') {
        setHasPermission(false);
        logger.info('Permission notifications refusée');
      }

      setLoading(false);
    };

    init();
  }, [user, registerFCM]);

  /**
   * Demande la permission et enregistre le token
   */
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Les notifications ne sont pas supportées sur ce navigateur');
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setHasPermission(true);
        const fcmToken = await registerFCM();
        setToken(fcmToken);
        logger.info('Permission accordée et token enregistré');
      } else {
        setHasPermission(false);
        logger.warn('Permission refusée');
      }
    } catch (error) {
      logger.error('Erreur demande permission', { error });
    }
  };

  /**
   * Réinitialise complètement les notifications
   * Utile si le token est invalide ou corrompu
   */
  const resetNotifications = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Non connecté' };
    }

    try {
      logger.info('Réinitialisation des notifications...');

      const messaging = getMessaging(app);

      // 1. Supprimer l'ancien token
      try {
        await deleteToken(messaging);
        logger.info('Ancien token supprimé');
      } catch {
        // Ignorer si pas de token
      }

      // 2. Désinstaller les anciens Service Workers FCM
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            await reg.unregister();
            logger.info('Ancien SW désinstallé');
          }
        }
      }

      // 3. Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Réenregistrer
      const newToken = await registerFCM();

      if (newToken) {
        setToken(newToken);
        return { success: true };
      } else {
        return { success: false, error: 'Impossible de générer un nouveau token' };
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('Échec réinitialisation', { error: message });
      return { success: false, error: message };
    }
  };

  return {
    hasPermission,
    token,
    loading,
    requestPermission,
    resetNotifications
  };
}
