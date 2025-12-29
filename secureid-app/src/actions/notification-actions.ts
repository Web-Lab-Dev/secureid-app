'use server';

/**
 * Server Actions pour envoyer des notifications push
 * Utilise Firebase Cloud Messaging (FCM) via Admin SDK
 */

import { adminDb, admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';

interface SendNotificationParams {
  /** ID du parent à notifier */
  parentId: string;
  /** Titre de la notification */
  title: string;
  /** Corps du message */
  body: string;
  /** Données additionnelles */
  data?: Record<string, string>;
}

interface SendNotificationResult {
  success: boolean;
  error?: string;
}

/**
 * Envoie une notification push au parent
 *
 * @param params - Paramètres de la notification
 * @returns Résultat de l'envoi
 */
export async function sendNotificationToParent(
  params: SendNotificationParams
): Promise<SendNotificationResult> {
  try {
    const { parentId, title, body, data } = params;

    // Récupérer le token FCM du parent depuis Firestore
    const userDoc = await adminDb.collection('users').doc(parentId).get();

    if (!userDoc.exists) {
      logger.error('User not found for notification', { parentId });
      return { success: false, error: 'Utilisateur introuvable' };
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;

    if (!fcmToken) {
      logger.warn('No FCM token for user', { parentId });
      return { success: false, error: 'Notifications non activées pour cet utilisateur' };
    }

    // Construire le message FCM
    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'secureid_alerts',
          priority: 'high' as const,
          sound: 'default',
          vibrationPattern: [200, 100, 200],
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          tag: 'secureid-scan',
        },
        fcmOptions: {
          link: '/dashboard',
        },
      },
    };

    // Envoyer via FCM
    const response = await admin.messaging().send(message);

    logger.info('Notification sent successfully', {
      parentId,
      messageId: response,
    });

    return { success: true };

  } catch (error: unknown) {
    logger.error('Error sending notification', {
      error,
      params,
    });

    // Gérer le cas où le token est invalide/expiré
    if (error instanceof Error && error.message.includes('registration-token-not-registered')) {
      // Supprimer le token invalide
      try {
        await adminDb.collection('users').doc(params.parentId).update({
          fcmToken: null,
        });
      } catch (updateError) {
        logger.error('Error removing invalid token', { updateError });
      }

      return { success: false, error: 'Token de notification expiré, veuillez réactiver les notifications' };
    }

    return { success: false, error: 'Erreur lors de l\'envoi de la notification' };
  }
}

/**
 * Envoie une notification de scan d'urgence
 *
 * @param parentId - ID du parent
 * @param childName - Nom de l'enfant
 * @param scannerLocation - Localisation du scan
 */
export async function sendEmergencyScanNotification(
  parentId: string,
  childName: string,
  scannerLocation?: string
): Promise<SendNotificationResult> {
  const locationText = scannerLocation ? ` à ${scannerLocation}` : '';

  return sendNotificationToParent({
    parentId,
    title: '🚨 Scan d\'urgence détecté',
    body: `Le bracelet de ${childName} a été scanné${locationText}`,
    data: {
      type: 'emergency_scan',
      childName,
      location: scannerLocation || '',
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Envoie une notification de bracelet perdu
 *
 * @param parentId - ID du parent
 * @param childName - Nom de l'enfant
 */
export async function sendBraceletLostNotification(
  parentId: string,
  childName: string
): Promise<SendNotificationResult> {
  return sendNotificationToParent({
    parentId,
    title: '⚠️ Bracelet déclaré perdu',
    body: `Le bracelet de ${childName} a été marqué comme perdu`,
    data: {
      type: 'bracelet_lost',
      childName,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Envoie une notification de bracelet retrouvé
 *
 * @param parentId - ID du parent
 * @param childName - Nom de l'enfant
 */
export async function sendBraceletFoundNotification(
  parentId: string,
  childName: string
): Promise<SendNotificationResult> {
  return sendNotificationToParent({
    parentId,
    title: '✅ Bracelet réactivé',
    body: `Le bracelet de ${childName} a été réactivé`,
    data: {
      type: 'bracelet_found',
      childName,
      timestamp: new Date().toISOString(),
    },
  });
}
