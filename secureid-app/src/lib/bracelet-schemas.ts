import { z } from 'zod';

/**
 * Schémas de validation pour les bracelets
 * Séparés des server actions car ce sont des objets, pas des fonctions async
 */

// Schéma de validation pour les IDs de bracelet (format BF-XXX, TEST-001, etc.)
export const braceletIdSchema = z.string().regex(/^[A-Z]{2,5}-\d{3,4}$/, 'Format d\'ID bracelet invalide');

// Schéma de validation pour les tokens secrets (64 caractères hexadécimaux)
// Note: Accepte majuscules et minuscules pour compatibilité copier-coller
export const secretTokenSchema = z.string().length(64, 'Le token doit contenir exactement 64 caractères').regex(/^[a-fA-F0-9]{64}$/, 'Le token doit être en format hexadécimal');
