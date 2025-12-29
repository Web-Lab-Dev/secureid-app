/**
 * RATE LIMITING HELPER
 *
 * Système de rate limiting avec persistance Firestore
 * Pour prévenir les attaques brute-force sur les PINs médecin
 *
 * STRATÉGIE:
 * - Max 5 tentatives par clé unique
 * - Fenêtre de 15 minutes
 * - Persistance Firestore (production-ready)
 * - Cache en mémoire pour optimisation (1 minute)
 *
 * AMÉLIORATION: Utilise Firestore au lieu de mémoire pour persistance
 * entre les requêtes serverless (fix problème audit)
 */

import { adminDb } from './firebase-admin';

interface RateLimitAttempt {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

// Cache court en mémoire pour optimiser les lectures Firestore (1 minute max)
const CACHE_TTL_MS = 60 * 1000; // 1 minute
const attemptCache = new Map<string, { data: RateLimitAttempt; cachedAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Récupère les données de rate limiting depuis Firestore (avec cache)
 *
 * @param key - Clé unique
 * @returns Données de tentatives ou null
 */
async function getRateLimitData(key: string): Promise<RateLimitAttempt | null> {
  const now = Date.now();

  // Vérifier le cache en mémoire d'abord (optimisation)
  const cached = attemptCache.get(key);
  if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
    return cached.data;
  }

  // Lire depuis Firestore
  try {
    const doc = await adminDb.collection('rate_limits').doc(key).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as RateLimitAttempt;

    // Mettre en cache
    attemptCache.set(key, { data, cachedAt: now });

    return data;
  } catch (error) {
    console.error('Error reading rate limit data:', error);
    return null;
  }
}

/**
 * Vérifie si une ressource est rate-limited
 *
 * @param key - Clé unique (ex: `pin_verify_${profileId}`)
 * @returns true si rate-limited, false sinon
 */
export async function isRateLimited(key: string): Promise<boolean> {
  const now = Date.now();

  // Récupérer depuis Firestore
  const data = await getRateLimitData(key);

  if (!data) {
    return false;
  }

  // Si la fenêtre a expiré, réinitialiser
  if (now - data.firstAttempt > WINDOW_MS) {
    await resetAttempts(key);
    return false;
  }

  // Si trop de tentatives
  return data.count >= MAX_ATTEMPTS;
}

/**
 * Enregistre une tentative
 *
 * @param key - Clé unique
 */
export async function recordAttempt(key: string): Promise<void> {
  const now = Date.now();

  // Récupérer les données existantes
  const existing = await getRateLimitData(key);

  let newData: RateLimitAttempt;

  if (existing) {
    // Si fenêtre expirée, réinitialiser
    if (now - existing.firstAttempt > WINDOW_MS) {
      newData = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else {
      // Incrémenter
      newData = {
        count: existing.count + 1,
        firstAttempt: existing.firstAttempt,
        lastAttempt: now,
      };
    }
  } else {
    // Première tentative
    newData = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
  }

  // Sauvegarder dans Firestore
  try {
    await adminDb.collection('rate_limits').doc(key).set(newData);

    // Mettre à jour le cache
    attemptCache.set(key, { data: newData, cachedAt: now });
  } catch (error) {
    console.error('Error recording attempt:', error);
  }
}

/**
 * Réinitialise le compteur (après succès)
 *
 * @param key - Clé unique
 */
export async function resetAttempts(key: string): Promise<void> {
  // Supprimer de Firestore
  try {
    await adminDb.collection('rate_limits').doc(key).delete();
  } catch (error) {
    console.error('Error resetting attempts:', error);
  }

  // Supprimer du cache
  attemptCache.delete(key);
}

/**
 * Obtient le temps restant avant déblocage (en secondes)
 *
 * @param key - Clé unique
 * @returns Secondes restantes, ou 0 si pas bloqué
 */
export async function getTimeRemaining(key: string): Promise<number> {
  // Récupérer depuis Firestore
  const data = await getRateLimitData(key);

  if (!data || data.count < MAX_ATTEMPTS) {
    return 0;
  }

  const elapsed = Date.now() - data.firstAttempt;
  const remaining = WINDOW_MS - elapsed;

  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
