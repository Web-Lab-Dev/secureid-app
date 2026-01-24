'use server';

import { adminDb } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import type { BraceletDocument } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';

/**
 * BRACELET QUERIES - Requêtes de lecture (bracelets, scans)
 */

export interface GetBraceletsByProfileIdsInput {
  profileIds: string[];
  userId: string;
}

export interface GetBraceletsByProfileIdsResult {
  success: boolean;
  bracelets?: Record<string, BraceletDocument>;
  error?: string;
}

/**
 * Récupère les bracelets liés à plusieurs profils (Server Action pour dashboard)
 *
 * SÉCURITÉ:
 * - Vérifie que tous les profils appartiennent bien au userId
 * - Filtre automatiquement les champs sensibles (secretToken JAMAIS exposé)
 * - Utilise Admin SDK pour éviter exposition Client SDK
 *
 * @param input - IDs des profils et userId
 * @returns Map des bracelets par braceletId (sans secretToken)
 */
export async function getBraceletsByProfileIds(
  input: GetBraceletsByProfileIdsInput
): Promise<GetBraceletsByProfileIdsResult> {
  try {
    const { profileIds, userId } = input;

    if (!userId) {
      return {
        success: false,
        error: 'Utilisateur non authentifié',
      };
    }

    if (!profileIds || profileIds.length === 0) {
      return {
        success: true,
        bracelets: {},
      };
    }

    // Limiter à 10 profils max pour éviter requêtes trop lourdes
    if (profileIds.length > 10) {
      return {
        success: false,
        error: 'Trop de profils demandés (max 10)',
      };
    }

    // 1. Vérifier que tous les profils appartiennent au userId
    const profilesPromises = profileIds.map(async (profileId) => {
      const profileSnap = await adminDb.collection('profiles').doc(profileId).get();
      if (!profileSnap.exists) {
        throw new Error(`Profil ${profileId} inexistant`);
      }
      const profileData = profileSnap.data() as ProfileDocument;
      if (profileData.parentId !== userId) {
        throw new Error(`Accès refusé au profil ${profileId}`);
      }
      return {
        profileId,
        braceletId: profileData.currentBraceletId,
      };
    });

    const profiles = await Promise.all(profilesPromises);

    // 2. Récupérer les bracelets (filtrer les profils sans bracelet)
    const braceletIds = profiles
      .filter(p => p.braceletId)
      .map(p => p.braceletId as string);

    if (braceletIds.length === 0) {
      return {
        success: true,
        bracelets: {},
      };
    }

    const braceletsMap: Record<string, BraceletDocument> = {};

    await Promise.all(
      braceletIds.map(async (braceletId) => {
        try {
          const braceletSnap = await adminDb.collection('bracelets').doc(braceletId).get();

          if (braceletSnap.exists) {
            const braceletData = braceletSnap.data() as BraceletDocument;

            // ⚠️ SÉCURITÉ: Ne JAMAIS exposer secretToken
            const { secretToken, id, ...safeBraceletData } = braceletData;

            braceletsMap[braceletId] = {
              id: braceletSnap.id,
              ...safeBraceletData,
            } as BraceletDocument;
          } else {
            logger.warn('Bracelet not found', { braceletId });
          }
        } catch (err) {
          logger.warn('Failed to load bracelet', { braceletId, error: err });
        }
      })
    );

    return {
      success: true,
      bracelets: braceletsMap,
    };

  } catch (error) {
    logger.error('Error getting bracelets by profile IDs', { error, profileIds: input.profileIds });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération des bracelets',
    };
  }
}

export interface GetRecentScansInput {
  profileIds: string[];
  userId: string;
}

export interface ScanData {
  scanId: string;
  braceletId: string;
  timestamp: string;
  lat: number | null;
  lng: number | null;
  userAgent: string;
  isRead?: boolean;
  childName?: string;
}

export interface GetRecentScansResult {
  success: boolean;
  scans?: ScanData[];
  unreadCount?: number;
  error?: string;
}

/**
 * Récupère les scans récents pour les profils d'un utilisateur
 * Alternative sécurisée au onSnapshot côté client qui cause des erreurs de permissions
 */
export async function getRecentScans(
  input: GetRecentScansInput
): Promise<GetRecentScansResult> {
  try {
    const { profileIds, userId } = input;

    if (!userId) {
      return {
        success: false,
        error: 'Utilisateur non authentifié',
      };
    }

    if (!profileIds || profileIds.length === 0) {
      return {
        success: true,
        scans: [],
        unreadCount: 0,
      };
    }

    // 1. Vérifier ownership des profils et récupérer braceletIds
    const braceletIds: string[] = [];
    const profilesMap = new Map<string, string>(); // braceletId -> childName

    for (const profileId of profileIds) {
      const profileSnap = await adminDb.collection('profiles').doc(profileId).get();

      if (!profileSnap.exists) {
        continue;
      }

      const profileData = profileSnap.data() as ProfileDocument;

      // Vérifier ownership
      if (profileData.parentId !== userId) {
        logger.warn('Tentative d\'accès non autorisé aux scans', { userId, profileId });
        continue;
      }

      if (profileData.currentBraceletId) {
        braceletIds.push(profileData.currentBraceletId);
        profilesMap.set(profileData.currentBraceletId, profileData.fullName);
      }
    }

    if (braceletIds.length === 0) {
      return {
        success: true,
        scans: [],
        unreadCount: 0,
      };
    }

    // 2. Récupérer les scans pour ces bracelets (limité à 10 bracelets max par Firestore)
    const scansSnapshot = await adminDb
      .collection('scans')
      .where('braceletId', 'in', braceletIds.slice(0, 10))
      .orderBy('timestamp', 'desc')
      .limit(50) // Limiter à 50 scans récents
      .get();

    const scans: ScanData[] = [];
    let unreadCount = 0;

    scansSnapshot.forEach((doc) => {
      const data = doc.data();
      const childName = profilesMap.get(data.braceletId) || 'Inconnu';

      scans.push({
        scanId: doc.id,
        braceletId: data.braceletId,
        timestamp: data.timestamp?._seconds
          ? new Date(data.timestamp._seconds * 1000).toISOString()
          : new Date().toISOString(),
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        userAgent: data.userAgent || '',
        isRead: data.isRead === true,
        childName,
      });

      if (data.isRead !== true) {
        unreadCount++;
      }
    });

    return {
      success: true,
      scans,
      unreadCount,
    };

  } catch (error) {
    logger.error('Error getting recent scans', { error, profileIds: input.profileIds });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération des scans',
    };
  }
}
