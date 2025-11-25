/**
 * PHASE 3A - HELPERS AUTHENTIFICATION
 *
 * Utilitaires pour le système d'authentification par "magic email"
 * Le parent entre son numéro → on génère un email unique
 */

/**
 * Domaine utilisé pour les emails générés
 */
const EMAIL_DOMAIN = 'secureid.bf';

/**
 * Normalise un numéro de téléphone Burkina Faso
 *
 * Accepte les formats:
 * - "72259827" → "+22672259827"
 * - "+226 72 25 98 27" → "+22672259827"
 * - "+22672259827" → "+22672259827"
 *
 * @param phone - Numéro de téléphone
 * @returns Numéro normalisé au format international
 */
export function normalizePhoneNumber(phone: string): string {
  // Retirer tous les espaces et caractères non numériques sauf le +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Si commence par 226 sans +, ajouter le +
  if (cleaned.startsWith('226') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  // Si ne commence pas par +226, c'est un numéro local (8 chiffres)
  if (!cleaned.startsWith('+226')) {
    cleaned = '+226' + cleaned;
  }

  return cleaned;
}

/**
 * Extrait les 8 derniers chiffres d'un numéro de téléphone
 *
 * Utilisé pour générer l'email et pour l'affichage
 *
 * @param phone - Numéro de téléphone (normalisé ou non)
 * @returns Les 8 derniers chiffres
 *
 * @example
 * extractLocalNumber("+22672259827") // "72259827"
 * extractLocalNumber("72259827") // "72259827"
 */
export function extractLocalNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-8);
}

/**
 * Génère un email unique à partir d'un numéro de téléphone
 *
 * Format: {8_derniers_chiffres}@secureid.bf
 *
 * @param phone - Numéro de téléphone (n'importe quel format)
 * @returns Email généré
 *
 * @example
 * generateEmailFromPhone("72259827") // "72259827@secureid.bf"
 * generateEmailFromPhone("+22672259827") // "72259827@secureid.bf"
 * generateEmailFromPhone("+226 72 25 98 27") // "72259827@secureid.bf"
 */
export function generateEmailFromPhone(phone: string): string {
  const localNumber = extractLocalNumber(phone);
  return `${localNumber}@${EMAIL_DOMAIN}`;
}

/**
 * Formate un numéro de téléphone pour l'affichage
 *
 * @param phone - Numéro de téléphone
 * @param format - Format d'affichage
 * @returns Numéro formaté
 *
 * @example
 * formatPhoneForDisplay("72259827", "local") // "72 25 98 27"
 * formatPhoneForDisplay("72259827", "international") // "+226 72 25 98 27"
 * formatPhoneForDisplay("72259827", "compact") // "72259827"
 */
export function formatPhoneForDisplay(
  phone: string,
  format: 'local' | 'international' | 'compact' = 'local'
): string {
  const normalized = normalizePhoneNumber(phone);
  const localNumber = extractLocalNumber(normalized);

  switch (format) {
    case 'international':
      return `+226 ${localNumber.slice(0, 2)} ${localNumber.slice(2, 4)} ${localNumber.slice(4, 6)} ${localNumber.slice(6, 8)}`;

    case 'local':
      return `${localNumber.slice(0, 2)} ${localNumber.slice(2, 4)} ${localNumber.slice(4, 6)} ${localNumber.slice(6, 8)}`;

    case 'compact':
      return localNumber;

    default:
      return localNumber;
  }
}

/**
 * Valide qu'un numéro de téléphone est au format Burkina Faso
 *
 * Les numéros valides commencent par 5, 6 ou 7 (opérateurs BF)
 *
 * @param phone - Numéro à valider
 * @returns true si le numéro est valide
 *
 * @example
 * isValidBurkinaPhone("72259827") // true
 * isValidBurkinaPhone("52259827") // true
 * isValidBurkinaPhone("92259827") // false (ne commence pas par 5,6,7)
 * isValidBurkinaPhone("7225982") // false (seulement 7 chiffres)
 */
export function isValidBurkinaPhone(phone: string): boolean {
  const localNumber = extractLocalNumber(phone);

  // Doit avoir exactement 8 chiffres
  if (localNumber.length !== 8) {
    return false;
  }

  // Doit commencer par 5, 6 ou 7 (opérateurs mobiles Burkina Faso)
  const firstDigit = localNumber[0];
  return ['5', '6', '7'].includes(firstDigit);
}

/**
 * Masque un numéro de téléphone pour l'affichage public
 *
 * @param phone - Numéro à masquer
 * @returns Numéro masqué
 *
 * @example
 * maskPhoneNumber("72259827") // "72 ** ** 27"
 * maskPhoneNumber("+22672259827") // "+226 72 ** ** 27"
 */
export function maskPhoneNumber(phone: string): string {
  const localNumber = extractLocalNumber(phone);
  return `${localNumber.slice(0, 2)} ** ** ${localNumber.slice(6, 8)}`;
}
