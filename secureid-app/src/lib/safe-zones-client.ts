/**
 * CLIENT-SIDE SAFE ZONES HELPERS
 *
 * Fonctions côté client pour charger les zones de sécurité
 * Utilise Firebase Client SDK au lieu de Server Actions
 */

import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import type { SafeZoneDocument } from '@/types/safe-zone';
import { logger } from '@/lib/logger';

/**
 * Charger toutes les zones de sécurité d'un profil (Client-side)
 */
export async function getSafeZonesClient(profileId: string): Promise<SafeZoneDocument[]> {
  try {
    const zonesRef = collection(db, 'profiles', profileId, 'safeZones');
    const q = query(zonesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const zones: SafeZoneDocument[] = snapshot.docs.map(doc => {
      const data = doc.data();
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
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    logger.info('Safe zones loaded (client)', { profileId, count: zones.length });
    return zones;
  } catch (error) {
    logger.error('Error loading safe zones (client)', { error, profileId });
    throw error;
  }
}
