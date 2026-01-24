'use server';

import { adminDb, admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import type { BraceletDocument } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';
import { validateBraceletToken } from './bracelet-validation';

/**
 * BRACELET LINKING - Liaison, transfert et déliaison de bracelets
 */

export interface LinkBraceletToProfileInput {
  /** ID du bracelet à lier */
  braceletId: string;
  /** ID du profil à lier */
  profileId: string;
  /** Token secret pour validation */
  token: string;
  /** ID de l'utilisateur (pour vérifier les permissions) */
  userId: string;
}

export interface LinkBraceletToProfileResult {
  success: boolean;
  error?: string;
}

/**
 * Lie un bracelet INACTIVE à un nouveau profil enfant (première activation)
 *
 * FLUX D'ACTIVATION:
 * 1. Parent achète un bracelet (statut INACTIVE)
 * 2. Parent scanne le QR code → Redirigé vers page d'activation
 * 3. Parent crée un profil enfant (allergies, contacts urgence, etc.)
 * 4. Cette fonction lie le bracelet au profil et passe le statut à ACTIVE
 *
 * TRANSACTION ATOMIQUE:
 * Utilise une transaction Firestore pour garantir la cohérence:
 * - Impossible qu'un bracelet soit lié à 2 profils simultanément
 * - Impossible qu'un profil ait 2 bracelets en même temps
 * - Si une étape échoue, tout est rollback automatiquement
 *
 * VÉRIFICATIONS DE SÉCURITÉ:
 * 1. Token valide (anti-clonage)
 * 2. Profil appartient bien à l'utilisateur connecté
 * 3. Bracelet est bien INACTIVE (pas déjà utilisé)
 * 4. Profil n'a pas déjà un bracelet actif
 *
 * @param input - IDs du bracelet, profil, user + token de validation
 * @returns Succès ou erreur détaillée
 */
export async function linkBraceletToProfile(
  input: LinkBraceletToProfileInput
): Promise<LinkBraceletToProfileResult> {
  try {
    const { braceletId, profileId, token, userId } = input;

    const validation = await validateBraceletToken({ braceletId, token });
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Transaction atomique pour éviter les race conditions
    // (ex: 2 parents qui activent le même bracelet au même moment)
    const result = await adminDb.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
      const braceletRef = adminDb.collection('bracelets').doc(braceletId);
      const profileRef = adminDb.collection('profiles').doc(profileId);

      const braceletSnap = await transaction.get(braceletRef);
      const profileSnap = await transaction.get(profileRef);

      if (!braceletSnap.exists) {
        throw new Error('Bracelet introuvable');
      }

      if (!profileSnap.exists) {
        throw new Error('Profil introuvable');
      }

      const bracelet = braceletSnap.data() as BraceletDocument;
      const profile = profileSnap.data() as ProfileDocument;

      // SÉCURITÉ: Vérifier que l'utilisateur possède bien le profil
      if (profile.parentId !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à lier ce profil');
      }

      // LOGIQUE MÉTIER: Un bracelet INACTIVE ne peut être activé qu'une seule fois
      if (bracelet.status !== 'INACTIVE') {
        throw new Error(
          'Ce bracelet est déjà activé. Utilisez la fonction de transfert.'
        );
      }

      // COHÉRENCE: Un profil ne peut avoir qu'un seul bracelet actif à la fois
      if (profile.currentBraceletId) {
        throw new Error('Ce profil a déjà un bracelet lié');
      }

      // Mise à jour atomique du bracelet: INACTIVE → ACTIVE
      transaction.update(braceletRef, {
        status: 'ACTIVE',
        linkedUserId: userId,
        linkedProfileId: profileId,
      });

      // Mise à jour du profil avec référence au bracelet
      transaction.update(profileRef, {
        currentBraceletId: braceletId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    });

    return result;
  } catch (error) {
    logger.error('Error linking bracelet to profile', { error, braceletId: input.braceletId, profileId: input.profileId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la liaison',
    };
  }
}

export interface TransferBraceletInput {
  /** ID de l'ancien bracelet (à délier) */
  oldBraceletId: string;
  /** ID du nouveau bracelet (à lier) */
  newBraceletId: string;
  /** ID du profil à transférer */
  profileId: string;
  /** Token du nouveau bracelet */
  newBraceletToken: string;
  /** ID de l'utilisateur (pour vérifier les permissions) */
  userId: string;
}

export interface TransferBraceletResult {
  success: boolean;
  error?: string;
}

/**
 * Transfère un profil d'un ancien bracelet vers un nouveau bracelet
 * Utilisé en cas de perte, vol, ou remplacement du bracelet
 *
 * Transaction atomique qui:
 * 1. Délie l'ancien bracelet du profil
 * 2. Met l'ancien bracelet en statut DEACTIVATED
 * 3. Lie le nouveau bracelet au profil
 * 4. Met le nouveau bracelet en statut ACTIVE
 *
 * @param input - Données de transfert
 * @returns Résultat du transfert
 */
export async function transferBracelet(
  input: TransferBraceletInput
): Promise<TransferBraceletResult> {
  try {
    const { oldBraceletId, newBraceletId, profileId, newBraceletToken, userId } = input;

    // Valider le token du nouveau bracelet
    const validation = await validateBraceletToken({
      braceletId: newBraceletId,
      token: newBraceletToken,
    });

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Transaction atomique pour éviter les incohérences
    const result = await adminDb.runTransaction(async (transaction) => {
      const oldBraceletRef = adminDb.collection('bracelets').doc(oldBraceletId);
      const newBraceletRef = adminDb.collection('bracelets').doc(newBraceletId);
      const profileRef = adminDb.collection('profiles').doc(profileId);

      // Récupérer tous les documents
      const [oldBraceletSnap, newBraceletSnap, profileSnap] = await Promise.all([
        transaction.get(oldBraceletRef),
        transaction.get(newBraceletRef),
        transaction.get(profileRef),
      ]);

      if (!oldBraceletSnap.exists) {
        throw new Error('Ancien bracelet introuvable');
      }

      if (!newBraceletSnap.exists) {
        throw new Error('Nouveau bracelet introuvable');
      }

      if (!profileSnap.exists) {
        throw new Error('Profil introuvable');
      }

      const oldBracelet = oldBraceletSnap.data() as BraceletDocument;
      const newBracelet = newBraceletSnap.data() as BraceletDocument;
      const profile = profileSnap.data() as ProfileDocument;

      // Vérifications de sécurité
      if (profile.parentId !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à transférer ce profil');
      }

      if (profile.currentBraceletId !== oldBraceletId) {
        throw new Error('Ce profil n\'est pas lié à l\'ancien bracelet spécifié');
      }

      if (oldBracelet.linkedProfileId !== profileId) {
        throw new Error('L\'ancien bracelet n\'est pas lié à ce profil');
      }

      if (newBracelet.status !== 'INACTIVE') {
        throw new Error('Le nouveau bracelet n\'est pas disponible pour activation');
      }

      // Étape 1: Délier et désactiver l'ancien bracelet
      transaction.update(oldBraceletRef, {
        status: 'DEACTIVATED',
        linkedUserId: null,
        linkedProfileId: null,
      });

      // Étape 2: Lier et activer le nouveau bracelet
      transaction.update(newBraceletRef, {
        status: 'ACTIVE',
        linkedUserId: userId,
        linkedProfileId: profileId,
      });

      // Étape 3: Mettre à jour le profil avec le nouveau bracelet
      transaction.update(profileRef, {
        currentBraceletId: newBraceletId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    });

    return result;
  } catch (error) {
    logger.error('Error transferring bracelet', { error, oldBraceletId: input.oldBraceletId, newBraceletId: input.newBraceletId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du transfert',
    };
  }
}

export interface UnlinkBraceletInput {
  /** ID du bracelet à délier */
  braceletId: string;
  /** ID du profil */
  profileId: string;
  /** ID de l'utilisateur (pour vérifier les permissions) */
  userId: string;
}

export interface UnlinkBraceletResult {
  success: boolean;
  error?: string;
}

/**
 * Délie un bracelet d'un profil sans le remplacer
 * Utilisé en cas de désactivation temporaire
 *
 * @param input - Données de déliaison
 * @returns Résultat de la déliaison
 */
export async function unlinkBracelet(
  input: UnlinkBraceletInput
): Promise<UnlinkBraceletResult> {
  try {
    const { braceletId, profileId, userId } = input;

    const result = await adminDb.runTransaction(async (transaction) => {
      const braceletRef = adminDb.collection('bracelets').doc(braceletId);
      const profileRef = adminDb.collection('profiles').doc(profileId);

      const [braceletSnap, profileSnap] = await Promise.all([
        transaction.get(braceletRef),
        transaction.get(profileRef),
      ]);

      if (!braceletSnap.exists) {
        throw new Error('Bracelet introuvable');
      }

      if (!profileSnap.exists) {
        throw new Error('Profil introuvable');
      }

      const profile = profileSnap.data() as ProfileDocument;

      // Vérifier les permissions
      if (profile.parentId !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à délier ce profil');
      }

      // Délier le bracelet
      transaction.update(braceletRef, {
        status: 'DEACTIVATED',
        linkedUserId: null,
        linkedProfileId: null,
      });

      // Mettre à jour le profil
      transaction.update(profileRef, {
        currentBraceletId: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    });

    return result;
  } catch (error) {
    logger.error('Error unlinking bracelet', { error, braceletId: input.braceletId, profileId: input.profileId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la déliaison',
    };
  }
}
