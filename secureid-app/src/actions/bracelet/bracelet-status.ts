'use server';

import { adminDb } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import type { BraceletDocument, BraceletStatus } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';
import { sendBraceletLostNotification, sendBraceletFoundNotification } from '../notification-actions';

/**
 * BRACELET STATUS - Gestion des statuts (LOST, STOLEN, ACTIVE, etc.)
 */

export interface UpdateBraceletStatusInput {
  /** ID du bracelet à mettre à jour */
  braceletId: string;
  /** Nouveau statut */
  status: BraceletStatus;
  /** ID de l'utilisateur (pour vérifier les permissions) */
  userId: string;
}

export interface UpdateBraceletStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Met à jour le statut d'un bracelet
 * Vérifie que l'utilisateur est bien le propriétaire
 *
 * @param input - ID bracelet, nouveau statut, user ID
 * @returns Résultat de la mise à jour
 */
export async function updateBraceletStatus(
  input: UpdateBraceletStatusInput
): Promise<UpdateBraceletStatusResult> {
  try {
    const { braceletId, status, userId } = input;

    // Récupérer le bracelet
    const braceletRef = adminDb.collection('bracelets').doc(braceletId);
    const braceletSnap = await braceletRef.get();

    if (!braceletSnap.exists) {
      return {
        success: false,
        error: 'Bracelet introuvable',
      };
    }

    const bracelet = braceletSnap.data() as BraceletDocument;

    // Vérifier les permissions
    if (bracelet.linkedUserId !== userId) {
      return {
        success: false,
        error: 'Vous n\'êtes pas autorisé à modifier ce bracelet',
      };
    }

    // Mettre à jour le statut
    await braceletRef.update({
      status,
    });

    // Envoyer notification selon le changement de statut
    if (bracelet.linkedProfileId) {
      try {
        const profileSnap = await adminDb.collection('profiles').doc(bracelet.linkedProfileId).get();

        if (profileSnap.exists) {
          const profile = profileSnap.data() as ProfileDocument;
          const childName = profile.fullName;

          // Notification si déclaré perdu (ACTIVE/autre → LOST)
          if (status === 'LOST' && bracelet.status !== 'LOST') {
            await sendBraceletLostNotification(userId, childName);
            logger.info('Bracelet lost notification sent', { braceletId, userId, childName });
          }

          // Notification si réactivé (LOST → ACTIVE)
          if (status === 'ACTIVE' && bracelet.status === 'LOST') {
            await sendBraceletFoundNotification(userId, childName);
            logger.info('Bracelet found notification sent', { braceletId, userId, childName });
          }
        }
      } catch (notifError) {
        // Ne pas faire échouer la mise à jour du statut si notification échoue
        logger.error('Error sending bracelet status notification', {
          error: notifError,
          braceletId,
          status,
        });
      }
    }

    return { success: true };
  } catch (error) {
    logger.error('Error updating bracelet status', { error, braceletId: input.braceletId, status: input.status });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    };
  }
}

export interface ReportBraceletInput {
  /** ID du bracelet */
  braceletId: string;
  /** ID de l'utilisateur */
  userId: string;
}

export interface ReportBraceletResult {
  success: boolean;
  error?: string;
}

/**
 * Déclare un bracelet comme perdu
 *
 * @param input - ID bracelet et user ID
 * @returns Résultat de l'opération
 */
export async function reportBraceletLost(
  input: ReportBraceletInput
): Promise<ReportBraceletResult> {
  return updateBraceletStatus({
    ...input,
    status: 'LOST',
  });
}

/**
 * Déclare un bracelet comme volé
 *
 * @param input - ID bracelet et user ID
 * @returns Résultat de l'opération
 */
export async function reportBraceletStolen(
  input: ReportBraceletInput
): Promise<ReportBraceletResult> {
  return updateBraceletStatus({
    ...input,
    status: 'STOLEN',
  });
}

/**
 * Réactive un bracelet (passe de LOST/STOLEN à ACTIVE)
 *
 * @param input - ID bracelet et user ID
 * @returns Résultat de l'opération
 */
export async function reactivateBracelet(
  input: ReportBraceletInput
): Promise<ReportBraceletResult> {
  return updateBraceletStatus({
    ...input,
    status: 'ACTIVE',
  });
}

export interface GetOwnerContactInput {
  braceletId: string;
}

export interface GetOwnerContactResult {
  success: boolean;
  phone?: string;
  error?: string;
}

/**
 * Récupère le numéro de téléphone du propriétaire d'un bracelet
 * Utilisé pour LOST mode (restitution)
 *
 * @param input - ID du bracelet
 * @returns Numéro de téléphone du parent
 */
export async function getOwnerContact(
  input: GetOwnerContactInput
): Promise<GetOwnerContactResult> {
  try {
    const { braceletId } = input;

    // Validation
    if (!braceletId || typeof braceletId !== 'string') {
      return {
        success: false,
        error: 'ID bracelet invalide',
      };
    }

    // Récupérer le bracelet
    const braceletRef = adminDb.collection('bracelets').doc(braceletId);
    const braceletSnap = await braceletRef.get();

    if (!braceletSnap.exists) {
      return {
        success: false,
        error: 'Bracelet introuvable',
      };
    }

    const bracelet = braceletSnap.data() as BraceletDocument;

    // Récupérer l'utilisateur propriétaire
    const userId = bracelet.linkedUserId;

    if (!userId) {
      return {
        success: false,
        error: 'Bracelet non lié à un utilisateur',
      };
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return {
        success: false,
        error: 'Utilisateur introuvable',
      };
    }

    const userData = userSnap.data();

    return {
      success: true,
      phone: userData?.phone || undefined,
    };
  } catch (error) {
    logger.error('Error getting owner contact', { error, braceletId: input.braceletId });
    return {
      success: false,
      error: 'Erreur lors de la récupération du contact',
    };
  }
}
