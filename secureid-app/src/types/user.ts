import { Timestamp } from 'firebase/firestore';

/**
 * PHASE 3A - TYPES USER
 *
 * Définit la structure des comptes utilisateurs parents
 * Utilise un système de "magic email" (numéro → email généré)
 */

/**
 * Document utilisateur parent dans Firestore (collection: users)
 */
export interface UserDocument {
  /** UID Firebase Auth */
  uid: string;

  /** Numéro de téléphone (format: 8 chiffres Burkina Faso) */
  phoneNumber: string;

  /** Email généré automatiquement à partir du numéro */
  generatedEmail: string;

  /** Nom d'affichage du parent */
  displayName: string;

  /** Date de création du compte */
  createdAt: Timestamp;

  /** Date de dernière connexion */
  lastLoginAt: Timestamp | null;

  /** Nombre de profils enfants créés */
  profileCount: number;
}

/**
 * Données pour création de compte
 */
export interface SignupData {
  /** Numéro de téléphone (8 chiffres) */
  phoneNumber: string;

  /** Mot de passe (minimum 8 caractères) */
  password: string;

  /** Nom complet du parent */
  displayName: string;
}

/**
 * Données pour connexion
 */
export interface LoginData {
  /** Numéro de téléphone (8 chiffres) */
  phoneNumber: string;

  /** Mot de passe */
  password: string;
}

/**
 * Type pour les données utilisateur après récupération Firestore
 */
export type UserData = Partial<UserDocument> & {
  uid: string;
  phoneNumber: string;
  generatedEmail: string;
};
