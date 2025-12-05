'use server';

import { adminDb } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import type { PickupDocument } from '@/types/profile';

/**
 * PHASE 8 - SCHOOL ACTIONS
 *
 * Actions serveur pour la gestion des sorties d'école
 */

/**
 * Vérifier le PIN école d'un profil
 */
export async function verifySchoolPin(data: {
  profileId: string;
  pin: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const profileRef = adminDb.collection('profiles').doc(data.profileId);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return { success: false, message: 'Profil introuvable' };
    }

    const profileData = profileDoc.data();
    const schoolPin = profileData?.schoolPin;

    if (!schoolPin) {
      return { success: false, message: 'Code école non configuré' };
    }

    if (schoolPin !== data.pin) {
      logger.warn('School PIN incorrect', { profileId: data.profileId });
      return { success: false, message: 'Code incorrect' };
    }

    logger.info('School PIN verified', { profileId: data.profileId });
    return { success: true };
  } catch (error) {
    logger.error('Error verifying school PIN', { error, profileId: data.profileId });
    return { success: false, message: 'Erreur serveur' };
  }
}

/**
 * Récupérer la liste des récupérateurs autorisés (non expirés)
 */
export async function getAuthorizedPickups(data: {
  profileId: string;
}): Promise<{ success: boolean; pickups?: PickupDocument[]; message?: string }> {
  try {
    const now = new Date();
    const pickupsRef = adminDb
      .collection('profiles')
      .doc(data.profileId)
      .collection('pickups');

    const snapshot = await pickupsRef.get();

    if (snapshot.empty) {
      return { success: true, pickups: [] };
    }

    // Filtrer les pass temporaires expirés
    const pickups: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Si pass temporaire, vérifier l'expiration
      if (data.type === 'TEMPORARY' && data.expiresAt) {
        const expiresDate = data.expiresAt.toDate();
        if (expiresDate < now) {
          // Pass expiré, ne pas inclure
          return;
        }
      }

      // Convertir les Timestamps en objets sérialisables
      pickups.push({
        id: doc.id,
        name: data.name,
        relation: data.relation,
        photoUrl: data.photoUrl,
        type: data.type,
        expiresAt: data.expiresAt ? data.expiresAt.toDate().toISOString() : null,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      });
    });

    return { success: true, pickups };
  } catch (error) {
    logger.error('Error getting authorized pickups', { error, profileId: data.profileId });
    return { success: false, message: 'Erreur lors de la récupération' };
  }
}

/**
 * Ajouter un récupérateur autorisé
 * Note: La photo doit être uploadée côté client avant d'appeler cette action
 */
export async function addPickup(data: {
  profileId: string;
  name: string;
  relation: string;
  photoUrl: string;
  type: 'PERMANENT' | 'TEMPORARY';
  expiresAt?: string; // ISO string
}): Promise<{ success: boolean; pickupId?: string; message?: string }> {
  try {
    const pickupRef = adminDb
      .collection('profiles')
      .doc(data.profileId)
      .collection('pickups')
      .doc();

    const pickupData = {
      name: data.name,
      relation: data.relation,
      photoUrl: data.photoUrl,
      type: data.type,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      createdAt: new Date(),
    };

    await pickupRef.set(pickupData);

    logger.info('Pickup added', { profileId: data.profileId, pickupId: pickupRef.id });

    return { success: true, pickupId: pickupRef.id };
  } catch (error) {
    logger.error('Error adding pickup', { error, profileId: data.profileId });
    return { success: false, message: 'Erreur lors de l\'ajout' };
  }
}

/**
 * Supprimer un récupérateur
 */
export async function deletePickup(data: {
  profileId: string;
  pickupId: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    await adminDb
      .collection('profiles')
      .doc(data.profileId)
      .collection('pickups')
      .doc(data.pickupId)
      .delete();

    logger.info('Pickup deleted', { profileId: data.profileId, pickupId: data.pickupId });

    return { success: true };
  } catch (error) {
    logger.error('Error deleting pickup', { error, profileId: data.profileId });
    return { success: false, message: 'Erreur lors de la suppression' };
  }
}

/**
 * Mettre à jour le code PIN école
 */
export async function updateSchoolPin(data: {
  profileId: string;
  newPin: string;
  parentId: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const profileRef = adminDb.collection('profiles').doc(data.profileId);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return { success: false, message: 'Profil introuvable' };
    }

    // Vérifier que le parent est bien le propriétaire
    const profileData = profileDoc.data();
    if (profileData?.parentId !== data.parentId) {
      return { success: false, message: 'Non autorisé' };
    }

    // Valider le PIN (4 chiffres)
    if (!/^\d{4}$/.test(data.newPin)) {
      return { success: false, message: 'Le code doit contenir exactement 4 chiffres' };
    }

    await profileRef.update({
      schoolPin: data.newPin,
      updatedAt: new Date(),
    });

    logger.info('School PIN updated', { profileId: data.profileId });

    return { success: true };
  } catch (error) {
    logger.error('Error updating school PIN', { error, profileId: data.profileId });
    return { success: false, message: 'Erreur lors de la mise à jour' };
  }
}
