'use server';

import { doc, getDoc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BraceletDocument, BraceletStatus } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 3E - SERVER ACTIONS BRACELETS
 *
 * Actions serveur pour la liaison et le transfert de bracelets
 */

interface ValidateBraceletTokenInput {
  /** ID du bracelet (ex: BF-0001) */
  braceletId: string;
  /** Token secret fourni par l'utilisateur */
  token: string;
}

interface ValidateBraceletTokenResult {
  valid: boolean;
  error?: string;
  braceletStatus?: string;
}

/**
 * Valide le token d'un bracelet
 *
 * @param input - ID du bracelet et token à valider
 * @returns Résultat de la validation
 */
export async function validateBraceletToken(
  input: ValidateBraceletTokenInput
): Promise<ValidateBraceletTokenResult> {
  try {
    const { braceletId, token } = input;

    // Récupérer le bracelet depuis Firestore
    const braceletRef = doc(db, 'bracelets', braceletId);
    const braceletSnap = await getDoc(braceletRef);

    if (!braceletSnap.exists()) {
      return {
        valid: false,
        error: 'Bracelet introuvable',
      };
    }

    const bracelet = braceletSnap.data() as BraceletDocument;

    // Vérifier le token
    if (bracelet.secretToken !== token) {
      return {
        valid: false,
        error: 'Token invalide',
      };
    }

    // Vérifier le statut du bracelet
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
    console.error('Error validating bracelet token:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la validation',
    };
  }
}

interface LinkBraceletToProfileInput {
  /** ID du bracelet à lier */
  braceletId: string;
  /** ID du profil à lier */
  profileId: string;
  /** Token secret pour validation */
  token: string;
  /** ID de l'utilisateur (pour vérifier les permissions) */
  userId: string;
}

interface LinkBraceletToProfileResult {
  success: boolean;
  error?: string;
}

/**
 * Lie un bracelet INACTIF à un nouveau profil
 * Utilisé lors de l'activation d'un nouveau bracelet
 *
 * @param input - Données de liaison
 * @returns Résultat de la liaison
 */
export async function linkBraceletToProfile(
  input: LinkBraceletToProfileInput
): Promise<LinkBraceletToProfileResult> {
  try {
    const { braceletId, profileId, token, userId } = input;

    // Valider d'abord le token
    const validation = await validateBraceletToken({ braceletId, token });
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Transaction atomique pour éviter les race conditions
    const result = await runTransaction(db, async (transaction) => {
      const braceletRef = doc(db, 'bracelets', braceletId);
      const profileRef = doc(db, 'profiles', profileId);

      // Récupérer le bracelet et le profil
      const braceletSnap = await transaction.get(braceletRef);
      const profileSnap = await transaction.get(profileRef);

      if (!braceletSnap.exists()) {
        throw new Error('Bracelet introuvable');
      }

      if (!profileSnap.exists()) {
        throw new Error('Profil introuvable');
      }

      const bracelet = braceletSnap.data() as BraceletDocument;
      const profile = profileSnap.data() as ProfileDocument;

      // Vérifier que le profil appartient bien à l'utilisateur
      if (profile.parentId !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à lier ce profil');
      }

      // Vérifier que le bracelet est INACTIVE
      if (bracelet.status !== 'INACTIVE') {
        throw new Error(
          'Ce bracelet est déjà activé. Utilisez la fonction de transfert.'
        );
      }

      // Vérifier que le profil n'a pas déjà un bracelet
      if (profile.currentBraceletId) {
        throw new Error('Ce profil a déjà un bracelet lié');
      }

      // Mettre à jour le bracelet
      transaction.update(braceletRef, {
        status: 'ACTIVE',
        linkedUserId: userId,
        linkedProfileId: profileId,
      });

      // Mettre à jour le profil
      transaction.update(profileRef, {
        currentBraceletId: braceletId,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    });

    return result;
  } catch (error) {
    console.error('Error linking bracelet to profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la liaison',
    };
  }
}

interface TransferBraceletInput {
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

interface TransferBraceletResult {
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
    const result = await runTransaction(db, async (transaction) => {
      const oldBraceletRef = doc(db, 'bracelets', oldBraceletId);
      const newBraceletRef = doc(db, 'bracelets', newBraceletId);
      const profileRef = doc(db, 'profiles', profileId);

      // Récupérer tous les documents
      const [oldBraceletSnap, newBraceletSnap, profileSnap] = await Promise.all([
        transaction.get(oldBraceletRef),
        transaction.get(newBraceletRef),
        transaction.get(profileRef),
      ]);

      if (!oldBraceletSnap.exists()) {
        throw new Error('Ancien bracelet introuvable');
      }

      if (!newBraceletSnap.exists()) {
        throw new Error('Nouveau bracelet introuvable');
      }

      if (!profileSnap.exists()) {
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
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    });

    return result;
  } catch (error) {
    console.error('Error transferring bracelet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du transfert',
    };
  }
}

interface UnlinkBraceletInput {
  /** ID du bracelet à délier */
  braceletId: string;
  /** ID du profil */
  profileId: string;
  /** ID de l'utilisateur (pour vérifier les permissions) */
  userId: string;
}

interface UnlinkBraceletResult {
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

    const result = await runTransaction(db, async (transaction) => {
      const braceletRef = doc(db, 'bracelets', braceletId);
      const profileRef = doc(db, 'profiles', profileId);

      const [braceletSnap, profileSnap] = await Promise.all([
        transaction.get(braceletRef),
        transaction.get(profileRef),
      ]);

      if (!braceletSnap.exists()) {
        throw new Error('Bracelet introuvable');
      }

      if (!profileSnap.exists()) {
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
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    });

    return result;
  } catch (error) {
    console.error('Error unlinking bracelet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la déliaison',
    };
  }
}

/**
 * PHASE 4 - ACTIONS STATUT BRACELET
 */

interface UpdateBraceletStatusInput {
  /** ID du bracelet à mettre à jour */
  braceletId: string;
  /** Nouveau statut */
  status: BraceletStatus;
  /** ID de l'utilisateur (pour vérifier les permissions) */
  userId: string;
}

interface UpdateBraceletStatusResult {
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
    const braceletRef = doc(db, 'bracelets', braceletId);
    const braceletSnap = await getDoc(braceletRef);

    if (!braceletSnap.exists()) {
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
    await updateDoc(braceletRef, {
      status,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating bracelet status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
    };
  }
}

interface ReportBraceletInput {
  /** ID du bracelet */
  braceletId: string;
  /** ID de l'utilisateur */
  userId: string;
}

interface ReportBraceletResult {
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
