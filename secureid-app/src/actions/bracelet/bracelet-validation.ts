'use server';

import { adminDb } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { braceletIdSchema, secretTokenSchema } from '@/lib/bracelet-schemas';
import type { BraceletDocument } from '@/types/bracelet';

/**
 * BRACELET VALIDATION - Validation des tokens et formats
 */

export interface ValidateBraceletTokenInput {
  braceletId: string;
  token: string;
}

export interface ValidateBraceletTokenResult {
  valid: boolean;
  error?: string;
  braceletStatus?: string;
}

/**
 * Valide le token secret d'un bracelet (première étape de sécurité)
 *
 * LOGIQUE DE SÉCURITÉ:
 * Cette fonction est la première barrière contre la fraude. Elle vérifie:
 * 1. Que le bracelet existe dans notre base de données
 * 2. Que le token fourni correspond au token gravé lors de la fabrication
 * 3. Que le bracelet n'est pas dans un état bloquant (STOLEN, DEACTIVATED)
 *
 * POURQUOI C'EST CRITIQUE:
 * - Un QR code peut être photocopié → Sans token, on ne peut pas prouver l'authenticité
 * - Le token est un secret partagé entre Firestore et le QR code physique
 * - Si les deux ne correspondent pas → C'est un clone/faux
 *
 * CAS D'USAGE:
 * - Avant toute activation de bracelet
 * - Avant tout transfert vers un nouveau bracelet
 * - Pour vérifier qu'un bracelet est légitime
 *
 * @param input - ID du bracelet et token à valider
 * @returns Validation + statut actuel du bracelet
 */
export async function validateBraceletToken(
  input: ValidateBraceletTokenInput
): Promise<ValidateBraceletTokenResult> {
  try {
    const { braceletId, token } = input;

    // 🔒 DEFENSE-IN-DEPTH: Validation format côté serveur
    const braceletIdValidation = braceletIdSchema.safeParse(braceletId);
    if (!braceletIdValidation.success) {
      return {
        valid: false,
        error: 'Format d\'ID bracelet invalide',
      };
    }

    const tokenValidation = secretTokenSchema.safeParse(token);
    if (!tokenValidation.success) {
      return {
        valid: false,
        error: 'Format de token invalide',
      };
    }

    const braceletRef = adminDb.collection('bracelets').doc(braceletId);
    const braceletSnap = await braceletRef.get();

    if (!braceletSnap.exists) {
      return {
        valid: false,
        error: 'Bracelet introuvable',
      };
    }

    const bracelet = braceletSnap.data() as BraceletDocument;

    // Vérification du token secret (clé de sécurité principale)
    // Comparaison case-insensitive pour compatibilité
    if (bracelet.secretToken.toLowerCase() !== token.toLowerCase()) {
      return {
        valid: false,
        error: 'Token invalide',
      };
    }

    // Vérifications de statut bloquant
    if (bracelet.status === 'STOLEN') {
      return {
        valid: false,
        error: 'Ce bracelet a été déclaré volé',
      };
    }

    if (bracelet.status === 'DEACTIVATED') {
      return {
        valid: false,
        error: 'Ce bracelet a été désactivé',
      };
    }

    return {
      valid: true,
      braceletStatus: bracelet.status,
    };
  } catch (error) {
    logger.error('Error validating bracelet token', { error, braceletId: input.braceletId });
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la validation',
    };
  }
}
