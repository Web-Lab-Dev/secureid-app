'use server';

import { adminDb, admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { isRateLimited, recordAttempt, resetAttempts, getTimeRemaining } from '@/lib/rate-limit';
import type { GeolocationData } from '@/types/scan';

/**
 * PHASE 5 - EMERGENCY ACTIONS
 *
 * Server Actions sécurisées pour:
 * - Validation PIN médecin
 * - Enregistrement scans GPS
 * - Génération URLs documents médicaux
 *
 * MIGRATION: Utilise Admin SDK au lieu du Client SDK pour:
 * - Meilleures performances (accès direct serveur)
 * - Contournement des règles Firestore
 * - Cohérence avec profile-actions et bracelet-actions
 */

interface VerifyPinInput {
  profileId: string;
  pin: string;
}

interface VerifyPinResult {
  success: boolean;
  error?: string;
}

/**
 * Vérifie le code PIN médecin d'un profil
 * CRITIQUE: Validation TOUJOURS côté serveur, jamais côté client
 *
 * SÉCURITÉ P1:
 * - Rate limiting: Max 5 tentatives par 15 minutes
 * - Prévention brute-force des PINs à 4 chiffres
 *
 * @param input - ID profil et PIN à vérifier
 * @returns Résultat de la validation
 */
export async function verifyDoctorPin(input: VerifyPinInput): Promise<VerifyPinResult> {
  try {
    const { profileId, pin } = input;

    // Validation des entrées AVANT requête DB
    if (!profileId || typeof profileId !== 'string' || profileId.trim().length === 0) {
      return {
        success: false,
        error: 'ID de profil invalide',
      };
    }

    // Validation basique du PIN
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return {
        success: false,
        error: 'Code PIN invalide (4 chiffres requis)',
      };
    }

    // RATE LIMITING: Vérifier si trop de tentatives
    const rateLimitKey = `pin_verify_${profileId}`;
    const isLimited = await isRateLimited(rateLimitKey);

    if (isLimited) {
      const timeRemaining = await getTimeRemaining(rateLimitKey);
      const minutes = Math.ceil(timeRemaining / 60);
      return {
        success: false,
        error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`,
      };
    }

    // Récupérer le profil via Admin SDK
    const profileRef = adminDb.collection('profiles').doc(profileId);
    const profileSnap = await profileRef.get();

    if (!profileSnap.exists) {
      // Enregistrer tentative même si profil introuvable (prévention énumération)
      await recordAttempt(rateLimitKey);
      return {
        success: false,
        error: 'Profil introuvable',
      };
    }

    const profile = profileSnap.data();

    // Comparer les PINs
    // TODO P1: Hasher les PINs avec bcrypt pour meilleure sécurité
    if (profile?.doctorPin !== pin) {
      // PIN incorrect - enregistrer tentative
      await recordAttempt(rateLimitKey);
      return {
        success: false,
        error: 'Code PIN incorrect',
      };
    }

    // PIN correct - réinitialiser le compteur
    await resetAttempts(rateLimitKey);

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error verifying PIN', { error, profileId: input.profileId });
    return {
      success: false,
      error: 'Erreur lors de la vérification du code',
    };
  }
}

interface RecordScanInput {
  braceletId: string;
  geolocation: GeolocationData | null;
  userAgent: string;
}

interface RecordScanResult {
  success: boolean;
  scanId?: string;
  error?: string;
}

/**
 * Enregistre un scan de bracelet dans Firestore
 * Utilisé pour tracking et notifications futures (n8n)
 *
 * @param input - Données du scan (bracelet, position GPS, user agent)
 * @returns ID du scan créé ou erreur
 */
export async function recordScan(input: RecordScanInput): Promise<RecordScanResult> {
  try {
    const { braceletId, geolocation, userAgent } = input;

    // Validation des entrées
    if (!braceletId || typeof braceletId !== 'string') {
      return {
        success: false,
        error: 'ID de bracelet invalide',
      };
    }

    const scanData = {
      braceletId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      lat: geolocation?.lat || null,
      lng: geolocation?.lng || null,
      userAgent: userAgent || 'unknown',
    };

    // Utiliser Admin SDK pour ajouter le document
    const scansCollection = adminDb.collection('scans');
    const scanDoc = await scansCollection.add(scanData);

    return {
      success: true,
      scanId: scanDoc.id,
    };
  } catch (error) {
    logger.error('Error recording scan', { error, braceletId: input.braceletId });
    return {
      success: false,
      error: 'Erreur lors de l\'enregistrement du scan',
    };
  }
}

interface MedicalDocument {
  name: string;
  url: string;
  type: 'pdf' | 'image';
  size?: number;
}

interface GetDocumentsInput {
  profileId: string;
  pin: string;
}

interface GetDocumentsResult {
  success: boolean;
  documents?: MedicalDocument[];
  error?: string;
}

/**
 * Récupère la liste des documents médicaux après validation PIN
 * Génère des URLs de téléchargement signées (sécurité Firebase Storage)
 *
 * NOTE: Firebase Storage nécessite toujours le Client SDK même dans Server Actions
 * car l'Admin SDK Storage a une API différente (bucket.file() au lieu de ref())
 *
 * @param input - ID profil et PIN validé
 * @returns Liste des documents avec URLs signées
 */
export async function getMedicalDocuments(
  input: GetDocumentsInput
): Promise<GetDocumentsResult> {
  try {
    const { profileId, pin } = input;

    // Validation des entrées
    if (!profileId || typeof profileId !== 'string' || profileId.trim().length === 0) {
      return {
        success: false,
        error: 'ID de profil invalide',
      };
    }

    // Vérifier le PIN d'abord
    const pinResult = await verifyDoctorPin({ profileId, pin });
    if (!pinResult.success) {
      return {
        success: false,
        error: pinResult.error,
      };
    }

    // Pour Firebase Storage, utiliser Admin SDK Storage
    // Note: Nécessite configuration différente - bucket() au lieu de ref()
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({
      prefix: `medical_docs/${profileId}/`,
    });

    if (!files || files.length === 0) {
      return {
        success: true,
        documents: [],
      };
    }

    // Générer les URLs signées pour chaque document
    const documents: MedicalDocument[] = await Promise.all(
      files.map(async (file) => {
        // Générer URL signée valide 1 heure
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 heure
        });

        const name = file.name.split('/').pop() || file.name;
        const type = name.endsWith('.pdf') ? 'pdf' : 'image';

        return {
          name,
          url,
          type,
          size: file.metadata.size ? parseInt(file.metadata.size, 10) : undefined,
        };
      })
    );

    return {
      success: true,
      documents,
    };
  } catch (error) {
    logger.error('Error fetching medical documents', { error, profileId: input.profileId });
    return {
      success: false,
      error: 'Erreur lors de la récupération des documents',
    };
  }
}
