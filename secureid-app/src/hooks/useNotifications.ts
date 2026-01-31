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
   * Nettoie les bases IndexedDB de Firebase (en cas de corruption)
   */
  const clearFirebaseIndexedDB = async (): Promise<void> => {
    if (typeof indexedDB === 'undefined') return;

    const dbNames = [
      'firebase-messaging-database',
      'firebase-installations-database',
      'firebaseLocalStorageDb'
    ];

    for (const dbName of dbNames) {
      try {
        await new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => {
            logger.info(`IndexedDB ${dbName} supprimée`);
            resolve();
          };
          request.onerror = () => reject(request.error);
          request.onblocked = () => {
            logger.warn(`IndexedDB ${dbName} bloquée`);
            resolve();
          };
        });
      } catch {
        // Ignorer les erreurs
      }
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

      // 1. Désinstaller tous les Service Workers FCM
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
            await reg.unregister();
            logger.info('Ancien SW désinstallé');
          }
        }
      }

      // 2. Nettoyer IndexedDB (résout les corruptions)
      await clearFirebaseIndexedDB();

      // 3. Attendre que tout soit nettoyé
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 4. Réenregistrer le SW
      let swRegistration: ServiceWorkerRegistration | undefined;
      if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          updateViaCache: 'none'
        });
        await navigator.serviceWorker.ready;
        logger.info('Nouveau SW enregistré');
      }

      // 5. Vérifier VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        return { success: false, error: 'VAPID key non configurée côté client' };
      }

      // 6. Obtenir nouveau token avec messaging frais
      const messaging = getMessaging(app);
      const newToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration
      });

      if (newToken) {
        setToken(newToken);

        // Sauvegarder dans Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          fcmToken: newToken,
          fcmTokenUpdatedAt: new Date()
        });

        logger.info('Nouveau token généré et sauvegardé');
        return { success: true };
      } else {
        return { success: false, error: 'getToken() a retourné null - vérifie les permissions' };
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';

      // Si c'est une erreur IndexedDB, suggérer de recharger la page
      if (message.includes('indexeddb') || message.includes('IndexedDB')) {
        return {
          success: false,
          error: 'Erreur IndexedDB - Recharge la page (tire vers le bas) et réessaie'
        };
      }

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
