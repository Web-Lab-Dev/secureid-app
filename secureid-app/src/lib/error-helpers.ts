/**
 * HELPERS DE GESTION D'ERREURS TYPE-SAFE
 *
 * Utilitaires pour gérer les erreurs de manière type-safe sans utiliser 'any'
 */

import { FirebaseError } from 'firebase/app';
import { logger } from './logger';

/**
 * Type guard pour vérifier si une erreur est une FirebaseError
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof FirebaseError;
}

/**
 * Type guard générique pour les erreurs avec un message
 */
export function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Extrait un message d'erreur user-friendly depuis n'importe quelle erreur
 */
export function getErrorMessage(error: unknown): string {
  if (isFirebaseError(error)) {
    // Messages d'erreur Firebase traduits
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/operation-not-allowed':
        return 'Opération non autorisée';
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé';
      case 'auth/user-not-found':
        return 'Aucun compte trouvé avec cet email';
      case 'auth/wrong-password':
        return 'Email ou mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      case 'auth/network-request-failed':
        return 'Erreur de connexion. Vérifiez votre connexion internet';
      case 'permission-denied':
        return 'Vous n\'avez pas les permissions nécessaires';
      case 'not-found':
        return 'Ressource introuvable';
      case 'already-exists':
        return 'Cette ressource existe déjà';
      case 'unauthenticated':
        return 'Vous devez être connecté pour effectuer cette action';
      default:
        return error.message || 'Une erreur est survenue';
    }
  }

  if (hasErrorMessage(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Une erreur inconnue est survenue';
}

/**
 * Log une erreur de manière sécurisée (uniquement en dev)
 */
export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${context}:`, error);
  }
}
