/**
 * Type pour les erreurs d'application
 * Remplace l'utilisation de 'any' dans les catch blocks
 */
export interface AppError extends Error {
  code?: string;
  details?: unknown;
}

/**
 * Type guard pour vérifier si une erreur est une erreur Firebase
 */
export function isFirebaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

/**
 * Convertit une erreur inconnue en AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof Error) {
    return error as AppError;
  }

  if (isFirebaseError(error)) {
    const appError = new Error(error.message) as AppError;
    appError.code = error.code;
    return appError;
  }

  if (typeof error === 'string') {
    return new Error(error) as AppError;
  }

  return new Error('Une erreur inconnue est survenue') as AppError;
}
