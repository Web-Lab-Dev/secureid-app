/**
 * Helper pour la gestion sécurisée des codes PIN médicaux
 * Utilise bcrypt pour hasher les PINs au lieu de les stocker en clair
 */

import bcrypt from 'bcryptjs';
import { validatePin } from './validation';

/**
 * Nombre de rounds pour bcrypt (10 = bon équilibre sécurité/performance)
 */
const BCRYPT_ROUNDS = 10;

/**
 * Hashe un code PIN avec bcrypt
 * @param pin - Code PIN à 6 chiffres (ex: "123456")
 * @returns Hash bcrypt du PIN
 * @throws Error si le PIN est invalide
 */
export async function hashPin(pin: string): Promise<string> {
  // Valider le format du PIN
  const validation = validatePin(pin);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Hasher avec bcrypt
  const hashed = await bcrypt.hash(pin, BCRYPT_ROUNDS);
  return hashed;
}

/**
 * Vérifie si un PIN correspond au hash stocké
 * @param pin - PIN en clair à vérifier
 * @param hashedPin - Hash bcrypt stocké en base
 * @returns true si le PIN correspond, false sinon
 */
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  // Valider le format du PIN
  const validation = validatePin(pin);
  if (!validation.valid) {
    return false; // PIN invalide = pas de match
  }

  try {
    // Comparer avec bcrypt
    const isMatch = await bcrypt.compare(pin, hashedPin);
    return isMatch;
  } catch (error) {
    // Hash corrompu ou erreur bcrypt
    console.error('Error verifying PIN:', error);
    return false;
  }
}

/**
 * Vérifie si une chaîne est un hash bcrypt valide
 * @param hash - Chaîne à vérifier
 * @returns true si c'est un hash bcrypt, false sinon
 */
export function isBcryptHash(hash: string): boolean {
  // Un hash bcrypt commence par $2a$, $2b$ ou $2y$ et fait 60 caractères
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(hash);
}

/**
 * Génère un code PIN aléatoire sécurisé (6 chiffres)
 * Utile pour les réinitialisations ou génération automatique
 * @returns PIN aléatoire (ex: "723856")
 */
export function generateRandomPin(): string {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  return pin;
}
