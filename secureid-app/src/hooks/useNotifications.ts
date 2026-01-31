'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getMessaging, getToken, onMessage, deleteToken, Messaging } from 'firebase/messaging';
import app from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Hook pour gérer les notifications push FCM
 *
 * Gère:
 * - Demande de permission
 * - Enregistrement du token FCM
 * - Messages en premier plan
 * - Réinitialisation si problèmes
 */

interface UseNotificationsReturn {
  hasPermission: boolean;
  token: string | null;
  loading: boolean;
  requestPermission: () => Promise<void>;
  resetNotifications: () => Promise<{ success: boolean; error?: string }>;
}

// Singleton pour éviter les handlers multiples
let messagingInstance: Messaging | null = null;
let onMessageUnsubscribe: (() => void) | null = null;

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuthContext();
  const [hasPermission, setHasPermission] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref pour éviter les initialisations multiples
  const initRef = useRef(false);

  /**
   * Obtient l'instance Messaging (singleton)
   */
  const getMessagingInstance = useCallback((): Messaging | null => {
    if (typeof window === 'undefined') return null;

    if (!messagingInstance) {
      try {
        messagingInstance = getMessaging(app);
      } catch (error) {
        logger.error('Erreur création Messaging', { error });
        return null;
      }
    }
    return messagingInstance;
  }, []);

  /**
   * Configure le handler pour les messages en premier plan
   * (Une seule fois, pas à chaque render)
   */
  const setupForegroundHandler = useCallback((messaging: Messaging) => {
    // Désabonner l'ancien handler si existe
    if (onMessageUnsubscribe) {
      onMessageUnsubscribe();
    }

    onMessageUnsubscribe = onMessage(messaging, (payload) => {
      logger.info('Message reçu (foreground)', {
        title: payload.notification?.title,
        body: payload.notification?.body
      });

      // Afficher notification même si app ouverte
      if (Notification.permission === 'granted' && payload.notification) {
        const { title, body } = payload.notification;

        new Notification(title || 'SecureID', {
          body: body || 'Nouvelle notification',
          icon: '/icon-192.png',
          badge: '/icon-72.png',
          tag: `secureid-fg-${Date.now()}`,
          requireInteraction: true
        });
      }
    });
  }, []);

  /**
   * Enregistre le SW et obtient le token FCM
   */
  const registerFCM = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      // 1. Enregistrer le Service Worker
      let swRegistration: ServiceWorkerRegistration | undefined;

      if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { updateViaCache: 'none' }
        );
        await navigator.serviceWorker.ready;
      }

      // 2. Vérifier VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        logger.error('VAPID key manquante');
        return null;
      }

      // 3. Obtenir instance Messaging
      const messaging = getMessagingInstance();
      if (!messaging) return null;

      // 4. Obtenir token FCM
      const fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration
      });

      if (!fcmToken) {
        logger.warn('Token FCM non obtenu');
        return null;
      }

      logger.info('Token FCM obtenu');

      // 5. Sauvegarder dans Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        fcmToken,
        fcmTokenUpdatedAt: new Date()
      });

      // 6. Configurer handler foreground (une seule fois)
      setupForegroundHandler(messaging);

      return fcmToken;

    } catch (error) {
      logger.error('Erreur registerFCM', { error });
      return null;
    }
  }, [user, getMessagingInstance, setupForegroundHandler]);

  /**
   * Initialisation
   */
  useEffect(() => {
    // Éviter les initialisations multiples
    if (initRef.current) return;

    if (!user) {
      setLoading(false);
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setLoading(false);
      return;
    }

    initRef.current = true;

    const init = async () => {
      const permission = Notification.permission;

      if (permission === 'granted') {
        setHasPermission(true);
        const fcmToken = await registerFCM();
        setToken(fcmToken);
      } else if (permission === 'denied') {
        setHasPermission(false);
      }
      // permission === 'default' : on attend que l'user demande

      setLoading(false);
    };

    init();

    // Cleanup
    return () => {
      initRef.current = false;
    };
  }, [user, registerFCM]);

  /**
   * Demande la permission utilisateur
   */
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Notifications non supportées');
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setHasPermission(true);
        const fcmToken = await registerFCM();
        setToken(fcmToken);
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      logger.error('Erreur requestPermission', { error });
    }
  }, [registerFCM]);

  /**
   * Réinitialise les notifications (en cas de problèmes)
   */
  const resetNotifications = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Non connecté' };
    }

    try {
      logger.info('Reset notifications...');

      // 1. Supprimer ancien token
      const messaging = getMessagingInstance();
      if (messaging) {
        try {
          await deleteToken(messaging);
        } catch {
          // Ignorer
        }
      }

      // 2. Réinitialiser le singleton
      messagingInstance = null;
      if (onMessageUnsubscribe) {
        onMessageUnsubscribe();
        onMessageUnsubscribe = null;
      }

      // 3. Désinstaller SW
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            await reg.unregister();
          }
        }
      }

      // 4. Nettoyer IndexedDB Firebase
      await cleanupIndexedDB();

      // 5. Attendre
      await new Promise(r => setTimeout(r, 1000));

      // 6. Réenregistrer
      initRef.current = false; // Permettre réinitialisation
      const newToken = await registerFCM();

      if (newToken) {
        setToken(newToken);
        return { success: true };
      }

      return { success: false, error: 'Token non généré' };

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur';
      logger.error('Reset échoué', { error: msg });
      return { success: false, error: msg };
    }
  }, [user, getMessagingInstance, registerFCM]);

  return {
    hasPermission,
    token,
    loading,
    requestPermission,
    resetNotifications
  };
}

/**
 * Nettoie les bases IndexedDB Firebase corrompues
 */
async function cleanupIndexedDB(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;

  const dbNames = [
    'firebase-messaging-database',
    'firebase-installations-database',
    'firebaseLocalStorageDb'
  ];

  for (const name of dbNames) {
    try {
      await new Promise<void>((resolve) => {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    } catch {
      // Ignorer
    }
  }
}
