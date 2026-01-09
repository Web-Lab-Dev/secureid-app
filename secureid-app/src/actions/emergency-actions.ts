'use server';

import { adminDb, admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { isRateLimited, recordAttempt, resetAttempts, getTimeRemaining } from '@/lib/rate-limit';
import type { GeolocationData } from '@/types/scan';
import { verifyPin, isBcryptHash } from '@/lib/pin-helper';
import { validatePin, validateGpsCoordinates } from '@/lib/validation';
import { ErrorCode, AppError } from '@/lib/error-codes';
import { sendEmergencyScanNotification } from './notification-actions';

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
 * SÉCURITÉ:
 * - Rate limiting: Max 5 tentatives par 15 minutes
 * - Prévention brute-force des PINs à 4 chiffres
 * - PINs hashés avec bcrypt (sécurité renforcée)
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

    // Validation stricte du PIN avec Zod
    const pinValidation = validatePin(pin);
    if (!pinValidation.valid) {
      return {
        success: false,
        error: pinValidation.error,
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
    const storedPin = profile?.doctorPin;

    if (!storedPin) {
      await recordAttempt(rateLimitKey);
      return {
        success: false,
        error: 'Code PIN non configuré',
      };
    }

    // Comparer les PINs avec bcrypt ou comparaison directe (migration progressive)
    let isPinValid = false;

    if (isBcryptHash(storedPin)) {
      // Nouveau système: PIN hashé avec bcrypt
      isPinValid = await verifyPin(pin, storedPin);
    } else {
      // Ancien système: PIN en clair (pour migration)
      isPinValid = storedPin === pin;

      // Migration automatique: hasher le PIN si la vérification réussit
      if (isPinValid) {
        const bcrypt = await import('bcryptjs');
        const hashedPin = await bcrypt.hash(pin, 10);
        await profileRef.update({ doctorPin: hashedPin });
        logger.info('PIN migrated to bcrypt', { profileId });
      }
    }

    if (!isPinValid) {
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
/**
 * Parse le User Agent pour extraire les informations d'appareil
 */
function parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
  const userAgent = ua.toLowerCase();

  // Détection du type d'appareil
  let deviceType = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    deviceType = 'mobile';
  }

  // Détection du navigateur
  let browser = 'Unknown';
  if (userAgent.includes('firefox')) browser = 'Firefox';
  else if (userAgent.includes('edg')) browser = 'Edge';
  else if (userAgent.includes('chrome')) browser = 'Chrome';
  else if (userAgent.includes('safari')) browser = 'Safari';
  else if (userAgent.includes('opera') || userAgent.includes('opr')) browser = 'Opera';

  // Détection de l'OS
  let os = 'Unknown';
  if (userAgent.includes('android')) os = 'Android';
  else if (userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'iOS';
  else if (userAgent.includes('mac')) os = 'macOS';
  else if (userAgent.includes('win')) os = 'Windows';
  else if (userAgent.includes('linux')) os = 'Linux';

  return { deviceType, browser, os };
}

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

    // Validation stricte des coordonnées GPS si présentes
    let sanitizedGeolocation: GeolocationData | null = geolocation;
    if (geolocation?.lat !== undefined && geolocation?.lng !== undefined) {
      const gpsValidation = validateGpsCoordinates(geolocation.lat, geolocation.lng);
      if (!gpsValidation.valid) {
        logger.warn('Invalid GPS coordinates', {
          braceletId,
          lat: geolocation.lat,
          lng: geolocation.lng,
          error: gpsValidation.error
        });
        // Ne pas bloquer le scan, juste invalider les coordonnées
        sanitizedGeolocation = null;
      }
    }

    // Parser le User Agent pour plus d'infos
    const deviceInfo = parseUserAgent(userAgent || '');

    // Reverse geocoding : convertir GPS en ville/pays
    let city: string | undefined;
    let country: string | undefined;

    if (sanitizedGeolocation?.lat && sanitizedGeolocation?.lng) {
      try {
        // Validation stricte de l'URL pour prévenir SSRF
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Whitelist des hosts autorisés
        const ALLOWED_HOSTS = [
          'secureid-app.vercel.app',
          'localhost:3000',
          'localhost:3001',
        ];

        try {
          const url = new URL(appUrl);
          if (!ALLOWED_HOSTS.includes(url.host)) {
            throw new Error(`Host non autorisé: ${url.host}`);
          }
        } catch (urlError) {
          logger.error('Invalid app URL', { appUrl, error: urlError });
          throw new Error('URL de l\'application invalide');
        }

        // Appeler notre API de geocoding
        const geocodeResponse = await fetch(`${appUrl}/api/geocode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: sanitizedGeolocation.lat,
            lng: sanitizedGeolocation.lng,
          }),
        });

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          city = geocodeData.city;
          country = geocodeData.country;
        }
      } catch (geocodeError) {
        // Geocoding échoué - continuer sans ville/pays
        logger.warn('Geocoding failed', { error: geocodeError });
      }
    }

    const scanData = {
      braceletId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      lat: sanitizedGeolocation?.lat || null,
      lng: sanitizedGeolocation?.lng || null,
      userAgent: userAgent || 'unknown',
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      city: city || null,
      country: country || null,
      isRead: false, // Nouveau scan non lu par défaut
    };

    // Utiliser Admin SDK pour ajouter le document
    const scansCollection = adminDb.collection('scans');
    const scanDoc = await scansCollection.add(scanData);

    // Envoyer notification push au parent
    try {
      // Récupérer les informations du bracelet et du profil
      const braceletDoc = await adminDb.collection('bracelets').doc(braceletId).get();

      if (braceletDoc.exists) {
        const braceletData = braceletDoc.data();
        const profileId = braceletData?.profileId;

        if (profileId) {
          const profileDoc = await adminDb.collection('profiles').doc(profileId).get();

          if (profileDoc.exists) {
            const profileData = profileDoc.data();
            const parentId = profileData?.parentId;
            const childName = profileData?.fullName;

            if (parentId && childName) {
              // Construire le message de localisation
              let locationText = '';
              if (city && country) {
                locationText = `${city}, ${country}`;
              } else if (geolocation?.lat && geolocation?.lng) {
                locationText = `${geolocation.lat.toFixed(4)}, ${geolocation.lng.toFixed(4)}`;
              }

              // Envoyer la notification (ne pas bloquer si ça échoue)
              await sendEmergencyScanNotification(parentId, childName, locationText);
              logger.info('Emergency scan notification sent', {
                parentId,
                childName,
                scanId: scanDoc.id,
              });
            }
          }
        }
      }
    } catch (notifError) {
      // Log l'erreur mais ne pas faire échouer le scan
      logger.error('Error sending scan notification', {
        error: notifError,
        braceletId,
        scanId: scanDoc.id,
      });
    }

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
 * NOTE: Firebase Storage Admin SDK utilise bucket.getFiles() et getSignedUrl()
 * au lieu de l'API Client SDK (ref() + getDownloadURL())
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

        // Gérer le type de size qui peut être string | number | undefined
        // Fix TypeScript: Forcer le type avant parseInt
        const rawSize = file.metadata.size;
        let size: number | undefined;
        if (rawSize !== undefined && rawSize !== null) {
          if (typeof rawSize === 'string') {
            const parsed = parseInt(rawSize, 10);
            size = isNaN(parsed) ? undefined : parsed;
          } else {
            size = rawSize as number;
          }
        }

        return {
          name,
          url,
          type,
          size,
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
