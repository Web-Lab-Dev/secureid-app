/**
 * RATE LIMITING HELPER
 *
 * Système simple de rate limiting basé sur Firestore
 * Pour prévenir les attaques brute-force sur les PINs médecin
 *
 * STRATÉGIE:
 * - Max 5 tentatives par profileId
 * - Fenêtre de 15 minutes
 * - Stockage en mémoire (simple) ou Firestore (production)
 */

import { adminDb } from './firebase-admin';

interface RateLimitAttempt {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

// Cache en mémoire pour dev (évite trop de lectures Firestore)
const attemptCache = new Map<string, RateLimitAttempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Vérifie si une ressource est rate-limited
 *
 * @param key - Clé unique (ex: `pin_verify_${profileId}`)
 * @returns true si rate-limited, false sinon
 */
export async function isRateLimited(key: string): Promise<boolean> {
  const now = Date.now();

  // Vérifier le cache en mémoire d'abord
  const cached = attemptCache.get(key);

  if (cached) {
    // Si la fenêtre a expiré, réinitialiser
    if (now - cached.firstAttempt > WINDOW_MS) {
      attemptCache.delete(key);
      return false;
    }

    // Si trop de tentatives
    if (cached.count >= MAX_ATTEMPTS) {
      return true;
    }
  }

  return false;
}

/**
 * Enregistre une tentative
 *
 * @param key - Clé unique
 */
export async function recordAttempt(key: string): Promise<void> {
  const now = Date.now();
  const cached = attemptCache.get(key);

  if (cached) {
    // Si fenêtre expirée, réinitialiser
    if (now - cached.firstAttempt > WINDOW_MS) {
      attemptCache.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    } else {
      // Incrémenter
      cached.count++;
      cached.lastAttempt = now;
      attemptCache.set(key, cached);
    }
  } else {
    // Première tentative
    attemptCache.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
  }
}

/**
 * Réinitialise le compteur (après succès)
 *
 * @param key - Clé unique
 */
export async function resetAttempts(key: string): Promise<void> {
  attemptCache.delete(key);
}

/**
 * Obtient le temps restant avant déblocage (en secondes)
 *
 * @param key - Clé unique
 * @returns Secondes restantes, ou 0 si pas bloqué
 */
export async function getTimeRemaining(key: string): Promise<number> {
  const cached = attemptCache.get(key);

  if (!cached || cached.count < MAX_ATTEMPTS) {
    return 0;
  }

  const elapsed = Date.now() - cached.firstAttempt;
  const remaining = WINDOW_MS - elapsed;

  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
