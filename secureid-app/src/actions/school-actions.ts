'use server';

import { db, storage } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { PickupDocument, CreatePickupData } from '@/types/profile';

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
    const profileRef = db.collection('profiles').doc(data.profileId);
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
    const pickupsRef = db
      .collection('profiles')
      .doc(data.profileId)
      .collection('pickups');

    const snapshot = await pickupsRef.get();

    if (snapshot.empty) {
      return { success: true, pickups: [] };
    }

    // Filtrer les pass temporaires expirés
    const pickups: PickupDocument[] = [];
    snapshot.forEach((doc) => {
      const pickupData = { id: doc.id, ...doc.data() } as PickupDocument;

      // Si pass temporaire, vérifier l'expiration
      if (pickupData.type === 'TEMPORARY' && pickupData.expiresAt) {
        const expiresDate = pickupData.expiresAt.toDate();
        if (expiresDate < now) {
          // Pass expiré, ne pas inclure
          return;
        }
      }

      pickups.push(pickupData);
    });

    return { success: true, pickups };
  } catch (error) {
    logger.error('Error getting authorized pickups', { error, profileId: data.profileId });
    return { success: false, message: 'Erreur lors de la récupération' };
  }
}

/**
 * Ajouter un récupérateur autorisé
 */
export async function addPickup(data: {
  profileId: string;
  pickup: CreatePickupData;
}): Promise<{ success: boolean; pickupId?: string; message?: string }> {
  try {
    // 1. Upload de la photo
    const photoFile = data.pickup.photoFile;
    const storageRef = ref(storage, `pickup_photos/${data.profileId}/${Date.now()}_${photoFile.name}`);

    const uploadResult = await uploadBytes(storageRef, photoFile);
    const photoUrl = await getDownloadURL(uploadResult.ref);

    // 2. Créer le document pickup
    const pickupRef = db
      .collection('profiles')
      .doc(data.profileId)
      .collection('pickups')
      .doc();

    const pickupData = {
      name: data.pickup.name,
      relation: data.pickup.relation,
      photoUrl,
      type: data.pickup.type,
      expiresAt: data.pickup.expiresAt ? new Date(data.pickup.expiresAt) : null,
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
    await db
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
    const profileRef = db.collection('profiles').doc(data.profileId);
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
