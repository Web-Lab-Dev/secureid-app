'use server';

import { adminDb, admin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import type { GeolocationData } from '@/types/scan';
import { validateGpsCoordinates } from '@/lib/validation';
import { sendEmergencyScanNotification } from '../notification-actions';

/**
 * EMERGENCY SCAN RECORDING
 * Enregistrement des scans de bracelets avec géolocalisation
 */

export interface RecordScanInput {
  braceletId: string;
  geolocation: GeolocationData | null;
  userAgent: string;
}

export interface RecordScanResult {
  success: boolean;
  scanId?: string;
  error?: string;
}

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
    // NOTE: Utiliser console.log car logger.info ne s'affiche pas en production
    try {
      console.log('📱 [SCAN-NOTIF] Starting notification process', { braceletId, scanId: scanDoc.id });

      // Récupérer les informations du bracelet et du profil
      const braceletDoc = await adminDb.collection('bracelets').doc(braceletId).get();

      if (!braceletDoc.exists) {
        console.log('❌ [SCAN-NOTIF] Bracelet not found', { braceletId });
      } else {
        const braceletData = braceletDoc.data();
        const profileId = braceletData?.linkedProfileId; // ← Correction: linkedProfileId, pas profileId
        console.log('📱 [SCAN-NOTIF] Bracelet found', { braceletId, linkedProfileId: profileId || 'NONE' });

        if (!profileId) {
          console.log('❌ [SCAN-NOTIF] No linkedProfileId in bracelet', { braceletId, braceletData });
        } else {
          const profileDoc = await adminDb.collection('profiles').doc(profileId).get();

          if (!profileDoc.exists) {
            console.log('❌ [SCAN-NOTIF] Profile not found', { profileId });
          } else {
            const profileData = profileDoc.data();
            const parentId = profileData?.parentId;
            const childName = profileData?.fullName;
            console.log('📱 [SCAN-NOTIF] Profile found', {
              profileId,
              parentId: parentId || 'NONE',
              childName: childName || 'NONE'
            });

            if (!parentId || !childName) {
              console.log('❌ [SCAN-NOTIF] Missing parentId or childName', {
                profileId,
                hasParentId: !!parentId,
                hasChildName: !!childName
              });
            } else {
              // Construire le message de localisation
              let locationText = '';
              if (city && country) {
                locationText = `${city}, ${country}`;
              } else if (geolocation?.lat && geolocation?.lng) {
                locationText = `${geolocation.lat.toFixed(4)}, ${geolocation.lng.toFixed(4)}`;
              }

              // Envoyer la notification
              console.log('📱 [SCAN-NOTIF] Sending notification...', { parentId, childName, locationText });
              const notifResult = await sendEmergencyScanNotification(parentId, childName, locationText);
              console.log('📱 [SCAN-NOTIF] Result:', {
                success: notifResult.success,
                error: notifResult.error
              });
            }
          }
        }
      }
    } catch (notifError) {
      console.error('❌ [SCAN-NOTIF] Error:', notifError instanceof Error ? notifError.message : notifError);
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
