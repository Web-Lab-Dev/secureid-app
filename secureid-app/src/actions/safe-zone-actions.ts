'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { SafeZoneDocument, SafeZoneInput } from '@/types/safe-zone';
import { logger } from '@/lib/logger';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * SAFE ZONE SERVER ACTIONS
 *
 * Actions serveur pour gérer les zones de sécurité
 * CRUD: Create, Read, Update, Delete, Toggle
 */

// Sérialise un Timestamp Admin SDK en objet plain (compatible Server Actions)
function serializeTimestamp(ts: FirebaseFirestore.Timestamp | undefined | null): { seconds: number; nanoseconds: number } {
  if (!ts) return { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  return { seconds: ts.seconds, nanoseconds: ts.nanoseconds };
}

// Convertir timestamp Firestore → SafeZoneDocument sérialisable pour Server Actions
function convertSafeZone(doc: FirebaseFirestore.DocumentSnapshot): SafeZoneDocument | null {
  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    id: doc.id,
    profileId: data.profileId,
    name: data.name,
    icon: data.icon,
    center: {
      lat: data.center.lat,
      lng: data.center.lng,
    },
    radius: data.radius,
    color: data.color,
    enabled: data.enabled ?? true,
    alertDelay: data.alertDelay,
    // Sérialiser les Timestamps en objets plain pour traverser la frontière server→client
    createdAt: serializeTimestamp(data.createdAt) as unknown as import('firebase/firestore').Timestamp,
    updatedAt: serializeTimestamp(data.updatedAt) as unknown as import('firebase/firestore').Timestamp,
  };
}

/**
 * Helper pour vérifier l'ownership d'un profil
 */
async function verifyProfileOwnership(profileId: string, userId: string): Promise<{ valid: boolean; error?: string }> {
  if (!userId || typeof userId !== 'string') {
    return { valid: false, error: 'Utilisateur non authentifié' };
  }

  const profileDoc = await adminDb.collection('profiles').doc(profileId).get();
  if (!profileDoc.exists) {
    return { valid: false, error: 'Profil introuvable' };
  }

  const profileData = profileDoc.data();
  if (profileData?.parentId !== userId) {
    logger.warn('Unauthorized safe zone access attempt', { profileId, userId });
    return { valid: false, error: 'Vous n\'êtes pas autorisé à accéder à ce profil' };
  }

  return { valid: true };
}

/**
 * GET SAFE ZONES - Récupérer toutes les zones d'un profil
 */
export async function getSafeZones(profileId: string, userId: string): Promise<SafeZoneDocument[]> {
  try {
    // 🔒 SECURITY: Vérifier que l'utilisateur possède ce profil
    const ownership = await verifyProfileOwnership(profileId, userId);
    if (!ownership.valid) {
      logger.warn('getSafeZones unauthorized', { profileId, userId, error: ownership.error });
      return [];
    }

    const snapshot = await adminDb
      .collection('profiles')
      .doc(profileId)
      .collection('safeZones')
      .orderBy('createdAt', 'desc')
      .limit(50) // Optimisation: limiter à 50 zones max
      .get();

    const zones = snapshot.docs
      .map(convertSafeZone)
      .filter((zone): zone is SafeZoneDocument => zone !== null);

    logger.info('Safe zones fetched', { profileId, count: zones.length });
    return zones;
  } catch (error) {
    logger.error('Error fetching safe zones', { error, profileId });
    return [];
  }
}

/**
 * CREATE SAFE ZONE - Créer une nouvelle zone
 */
export async function createSafeZone(
  profileId: string,
  userId: string,
  data: SafeZoneInput
): Promise<{ success: boolean; zone?: SafeZoneDocument; error?: string }> {
  try {
    // 🔒 SECURITY: Vérifier que l'utilisateur possède ce profil
    const ownership = await verifyProfileOwnership(profileId, userId);
    if (!ownership.valid) {
      return { success: false, error: ownership.error };
    }

    // Validation basique
    if (!data.name || data.name.length < 2 || data.name.length > 50) {
      return { success: false, error: 'Nom invalide (2-50 caractères)' };
    }

    if (data.radius < 100 || data.radius > 5000) {
      return { success: false, error: 'Rayon invalide (100-5000 mètres)' };
    }

    if (data.alertDelay < 1 || data.alertDelay > 60) {
      return { success: false, error: 'Délai alerte invalide (1-60 minutes)' };
    }

    // Créer la zone
    const now = Timestamp.now();
    const zoneData = {
      profileId,
      name: data.name,
      icon: data.icon,
      center: data.center,
      radius: data.radius,
      color: data.color,
      enabled: true,
      alertDelay: data.alertDelay,
      createdAt: now,
      updatedAt: now,
    };

    const zoneRef = await adminDb
      .collection('profiles')
      .doc(profileId)
      .collection('safeZones')
      .add(zoneData);

    logger.info('Safe zone created', { profileId, zoneId: zoneRef.id, zoneName: data.name });

    revalidatePath(`/dashboard/profile/${profileId}/safe-zones`);
    revalidatePath(`/dashboard/profile/${profileId}/tracking`);

    // Sérialiser les Timestamps pour le retour vers le client
    const createdZone = {
      id: zoneRef.id,
      ...zoneData,
      createdAt: { seconds: now.seconds, nanoseconds: now.nanoseconds } as unknown as Timestamp,
      updatedAt: { seconds: now.seconds, nanoseconds: now.nanoseconds } as unknown as Timestamp,
    } as SafeZoneDocument;

    return { success: true, zone: createdZone };
  } catch (error) {
    logger.error('Error creating safe zone', { error, profileId });
    return { success: false, error: 'Erreur lors de la création' };
  }
}

/**
 * UPDATE SAFE ZONE - Mettre à jour une zone existante
 */
export async function updateSafeZone(
  zoneId: string,
  profileId: string,
  userId: string,
  data: Partial<SafeZoneInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🔒 SECURITY: Vérifier que l'utilisateur possède ce profil
    const ownership = await verifyProfileOwnership(profileId, userId);
    if (!ownership.valid) {
      return { success: false, error: ownership.error };
    }

    // Validation si champs fournis
    if (data.name && (data.name.length < 2 || data.name.length > 50)) {
      return { success: false, error: 'Nom invalide (2-50 caractères)' };
    }

    if (data.radius && (data.radius < 100 || data.radius > 5000)) {
      return { success: false, error: 'Rayon invalide (100-5000 mètres)' };
    }

    if (data.alertDelay && (data.alertDelay < 1 || data.alertDelay > 60)) {
      return { success: false, error: 'Délai alerte invalide (1-60 minutes)' };
    }

    // Mettre à jour
    await adminDb
      .collection('profiles')
      .doc(profileId)
      .collection('safeZones')
      .doc(zoneId)
      .update({
        ...data,
        updatedAt: Timestamp.now(),
      });

    logger.info('Safe zone updated', { zoneId, profileId });

    revalidatePath(`/dashboard/profile/${profileId}/safe-zones`);
    revalidatePath(`/dashboard/profile/${profileId}/tracking`);

    return { success: true };
  } catch (error) {
    logger.error('Error updating safe zone', { error, zoneId, profileId });
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}

/**
 * DELETE SAFE ZONE - Supprimer une zone
 */
export async function deleteSafeZone(
  zoneId: string,
  profileId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🔒 SECURITY: Vérifier que l'utilisateur possède ce profil
    const ownership = await verifyProfileOwnership(profileId, userId);
    if (!ownership.valid) {
      return { success: false, error: ownership.error };
    }

    // Supprimer directement avec profileId
    await adminDb
      .collection('profiles')
      .doc(profileId)
      .collection('safeZones')
      .doc(zoneId)
      .delete();

    logger.info('Safe zone deleted', { zoneId, profileId });

    revalidatePath(`/dashboard/profile/${profileId}/safe-zones`);
    revalidatePath(`/dashboard/profile/${profileId}/tracking`);

    return { success: true };
  } catch (error) {
    logger.error('Error deleting safe zone', { error, zoneId });
    return { success: false, error: 'Erreur lors de la suppression' };
  }
}

/**
 * TOGGLE SAFE ZONE - Activer/désactiver une zone
 */
export async function toggleSafeZone(
  zoneId: string,
  profileId: string,
  userId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // 🔒 SECURITY: Vérifier que l'utilisateur possède ce profil
    const ownership = await verifyProfileOwnership(profileId, userId);
    if (!ownership.valid) {
      return { success: false, error: ownership.error };
    }

    // Toggle directement avec profileId
    await adminDb
      .collection('profiles')
      .doc(profileId)
      .collection('safeZones')
      .doc(zoneId)
      .update({
        enabled,
        updatedAt: Timestamp.now(),
      });

    logger.info('Safe zone toggled', { zoneId, profileId, enabled });

    revalidatePath(`/dashboard/profile/${profileId}/safe-zones`);
    revalidatePath(`/dashboard/profile/${profileId}/tracking`);

    return { success: true };
  } catch (error) {
    logger.error('Error toggling safe zone', { error, zoneId });
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
}
