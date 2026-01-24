'use server';

import { adminDb } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { isRateLimited, recordAttempt, resetAttempts, getTimeRemaining } from '@/lib/rate-limit';
import { verifyPin, isBcryptHash } from '@/lib/pin-helper';
import { validatePin } from '@/lib/validation';

/**
 * EMERGENCY PIN VERIFICATION
 * Validation sécurisée du code PIN médecin avec rate limiting
 */

export interface VerifyPinInput {
  profileId: string;
  pin: string;
}

export interface VerifyPinResult {
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

    // Comparer les PINs avec bcrypt ou comparaison constant-time (migration progressive)
    let isPinValid = false;

    if (isBcryptHash(storedPin)) {
      // Nouveau système: PIN hashé avec bcrypt
      isPinValid = await verifyPin(pin, storedPin);
    } else {
      // Ancien système: PIN en clair (pour migration)
      // 🔒 SECURITY: Utiliser comparaison constant-time pour éviter timing attacks
      const crypto = await import('crypto');
      const storedBuffer = Buffer.from(storedPin, 'utf8');
      const inputBuffer = Buffer.from(pin, 'utf8');

      // timingSafeEqual requiert des buffers de même longueur
      if (storedBuffer.length === inputBuffer.length) {
        isPinValid = crypto.timingSafeEqual(storedBuffer, inputBuffer);
      } else {
        isPinValid = false;
      }

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
