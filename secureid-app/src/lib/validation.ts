/**
 * Schémas de validation Zod pour l'application
 * Assure la sécurité et la cohérence des données
 */

import { z } from 'zod';

/**
 * Validation des coordonnées GPS
 */
export const gpsCoordinatesSchema = z.object({
  lat: z
    .number()
    .min(-90, 'La latitude doit être entre -90 et 90')
    .max(90, 'La latitude doit être entre -90 et 90'),
  lng: z
    .number()
    .min(-180, 'La longitude doit être entre -180 et 180')
    .max(180, 'La longitude doit être entre -180 et 180'),
});

export type GpsCoordinates = z.infer<typeof gpsCoordinatesSchema>;

/**
 * Validation du numéro de téléphone burkinabé
 */
export const phoneNumberSchema = z
  .string()
  .regex(/^[0-9]{8}$/, 'Le numéro doit contenir exactement 8 chiffres')
  .refine(
    (phone) => ['5', '6', '7'].includes(phone[0]),
    'Le numéro doit commencer par 5, 6 ou 7'
  );

/**
 * Validation de l'email
 */
export const emailSchema = z
  .string()
  .email('Format d\'email invalide')
  .min(5, 'L\'email doit contenir au moins 5 caractères')
  .max(100, 'L\'email est trop long');

/**
 * Validation du code PIN médical (6 chiffres)
 * Augmenté de 4 à 6 chiffres pour améliorer la sécurité (1M combinaisons vs 10K)
 */
export const pinSchema = z
  .string()
  .regex(/^[0-9]{6}$/, 'Le code PIN doit contenir exactement 6 chiffres');

/**
 * Validation du mot de passe
 */
export const passwordSchema = z
  .string()
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
  .max(100, 'Le mot de passe est trop long');

/**
 * Validation du nom complet
 */
export const fullNameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(100, 'Le nom est trop long')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides');

/**
 * Validation du groupe sanguin
 */
export const bloodTypeSchema = z.enum([
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Inconnu',
]);

/**
 * Validation de la date de naissance (format ISO)
 */
export const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
  .refine((date) => {
    const birthDate = new Date(date);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 150;
  }, 'Date de naissance invalide');

/**
 * Validation de l'ID de profil/bracelet
 */
export const idSchema = z
  .string()
  .min(3, 'ID trop court')
  .max(50, 'ID trop long')
  .regex(/^[a-zA-Z0-9-_]+$/, 'L\'ID contient des caractères invalides');

/**
 * Helper pour valider les coordonnées GPS
 */
export function validateGpsCoordinates(
  lat: unknown,
  lng: unknown
): { valid: true; data: GpsCoordinates } | { valid: false; error: string } {
  const result = gpsCoordinatesSchema.safeParse({ lat, lng });

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return {
    valid: false,
    error: result.error.issues[0]?.message || 'Coordonnées GPS invalides',
  };
}

/**
 * Helper pour valider un numéro de téléphone
 */
export function validatePhoneNumber(
  phone: string
): { valid: true; data: string } | { valid: false; error: string } {
  const result = phoneNumberSchema.safeParse(phone);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return {
    valid: false,
    error: result.error.issues[0]?.message || 'Numéro de téléphone invalide',
  };
}

/**
 * Helper pour valider un email
 */
export function validateEmail(
  email: string
): { valid: true; data: string } | { valid: false; error: string } {
  const result = emailSchema.safeParse(email);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return {
    valid: false,
    error: result.error.issues[0]?.message || 'Email invalide',
  };
}

/**
 * Helper pour valider un code PIN
 */
export function validatePin(
  pin: string
): { valid: true; data: string } | { valid: false; error: string } {
  const result = pinSchema.safeParse(pin);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return {
    valid: false,
    error: result.error.issues[0]?.message || 'Code PIN invalide',
  };
}

/**
 * Helper pour sanitiser une chaîne (prévenir XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Retirer < et >
    .trim();
}

/**
 * Helper pour hasher un numéro de téléphone (privacy dans les logs)
 */
export function hashPhoneForLogging(phone: string): string {
  // Garde les 2 premiers et 2 derniers chiffres
  if (phone.length < 4) return '****';
  return `${phone.slice(0, 2)}****${phone.slice(-2)}`;
}
