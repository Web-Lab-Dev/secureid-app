/**
 * Codes d'erreur standardisés pour l'application
 * Permet une gestion cohérente des erreurs côté client
 */

export enum ErrorCode {
  // Auth errors
  AUTH_PHONE_IN_USE = 'AUTH_PHONE_IN_USE',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',

  // Profile errors
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  PROFILE_UNAUTHORIZED = 'PROFILE_UNAUTHORIZED',
  PROFILE_INVALID_DATA = 'PROFILE_INVALID_DATA',

  // Bracelet errors
  BRACELET_NOT_FOUND = 'BRACELET_NOT_FOUND',
  BRACELET_ALREADY_ACTIVATED = 'BRACELET_ALREADY_ACTIVATED',
  BRACELET_UNAUTHORIZED = 'BRACELET_UNAUTHORIZED',

  // Emergency/Medical errors
  MEDICAL_INVALID_PIN = 'MEDICAL_INVALID_PIN',
  MEDICAL_RATE_LIMIT = 'MEDICAL_RATE_LIMIT',
  MEDICAL_ACCESS_DENIED = 'MEDICAL_ACCESS_DENIED',

  // Validation errors
  VALIDATION_INVALID_GPS = 'VALIDATION_INVALID_GPS',
  VALIDATION_INVALID_PHONE = 'VALIDATION_INVALID_PHONE',
  VALIDATION_INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',

  // Network/Server errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Messages d'erreur en français pour l'utilisateur
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Auth
  [ErrorCode.AUTH_PHONE_IN_USE]: 'Ce numéro de téléphone est déjà utilisé',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Le mot de passe est trop faible (min. 6 caractères)',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Identifiants incorrects',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'Utilisateur non trouvé',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Accès non autorisé',

  // Profile
  [ErrorCode.PROFILE_NOT_FOUND]: 'Profil introuvable',
  [ErrorCode.PROFILE_UNAUTHORIZED]: 'Vous n\'êtes pas autorisé à modifier ce profil',
  [ErrorCode.PROFILE_INVALID_DATA]: 'Données du profil invalides',

  // Bracelet
  [ErrorCode.BRACELET_NOT_FOUND]: 'Bracelet introuvable',
  [ErrorCode.BRACELET_ALREADY_ACTIVATED]: 'Ce bracelet est déjà activé',
  [ErrorCode.BRACELET_UNAUTHORIZED]: 'Vous n\'êtes pas autorisé à gérer ce bracelet',

  // Emergency/Medical
  [ErrorCode.MEDICAL_INVALID_PIN]: 'Code PIN incorrect',
  [ErrorCode.MEDICAL_RATE_LIMIT]: 'Trop de tentatives. Veuillez réessayer dans quelques minutes',
  [ErrorCode.MEDICAL_ACCESS_DENIED]: 'Accès refusé aux informations médicales',

  // Validation
  [ErrorCode.VALIDATION_INVALID_GPS]: 'Coordonnées GPS invalides',
  [ErrorCode.VALIDATION_INVALID_PHONE]: 'Numéro de téléphone invalide',
  [ErrorCode.VALIDATION_INVALID_EMAIL]: 'Adresse email invalide',
  [ErrorCode.VALIDATION_REQUIRED_FIELD]: 'Ce champ est obligatoire',

  // Network/Server
  [ErrorCode.NETWORK_ERROR]: 'Erreur réseau. Vérifiez votre connexion',
  [ErrorCode.SERVER_ERROR]: 'Erreur serveur. Veuillez réessayer',
  [ErrorCode.UNKNOWN_ERROR]: 'Une erreur inattendue s\'est produite',
};

/**
 * Classe d'erreur personnalisée avec code structuré
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public originalError?: unknown
  ) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'AppError';
  }

  /**
   * Retourne le message utilisateur
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * Retourne les détails pour le logging
   */
  getLogDetails(): {
    code: ErrorCode;
    message: string;
    originalError?: unknown;
  } {
    return {
      code: this.code,
      message: this.message,
      originalError: this.originalError,
    };
  }
}

/**
 * Helper pour vérifier si une erreur est une AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper pour convertir une erreur Firebase en AppError
 */
export function fromFirebaseError(error: unknown): AppError {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const firebaseError = error as { code: string; message: string };

    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
      case 'auth/phone-number-already-exists':
        return new AppError(ErrorCode.AUTH_PHONE_IN_USE, undefined, error);

      case 'auth/weak-password':
        return new AppError(ErrorCode.AUTH_WEAK_PASSWORD, undefined, error);

      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, undefined, error);

      case 'permission-denied':
        return new AppError(ErrorCode.AUTH_UNAUTHORIZED, undefined, error);

      default:
        return new AppError(ErrorCode.UNKNOWN_ERROR, firebaseError.message, error);
    }
  }

  return new AppError(ErrorCode.UNKNOWN_ERROR, undefined, error);
}
