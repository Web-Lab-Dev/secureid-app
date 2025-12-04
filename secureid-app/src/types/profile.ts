import { Timestamp } from 'firebase/firestore';

/**
 * PHASE 3A - TYPES PROFILE
 *
 * Définit la structure des profils enfants et informations médicales
 */

/**
 * Statuts possibles d'un profil enfant
 */
export type ProfileStatus = 'ACTIVE' | 'ARCHIVED';

/**
 * Groupes sanguins possibles
 */
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';

/**
 * Types de relations pour contacts d'urgence
 */
export type RelationshipType =
  | 'PARENT'
  | 'MOTHER'
  | 'FATHER'
  | 'GUARDIAN'
  | 'GRANDPARENT'
  | 'SIBLING'
  | 'DOCTOR'
  | 'OTHER';

/**
 * Contact d'urgence
 */
export interface EmergencyContact {
  /** Nom complet du contact */
  name: string;

  /** Relation avec l'enfant */
  relationship: RelationshipType;

  /** Numéro de téléphone (format international) */
  phone: string;

  /** Ordre de priorité (1 = premier à contacter) */
  priority: number;

  /** Email optionnel */
  email?: string;
}

/**
 * Informations médicales de l'enfant
 */
export interface MedicalInfo {
  /** Groupe sanguin */
  bloodType: BloodType;

  /** Liste des allergies (vide si aucune) */
  allergies: string[];

  /** Conditions médicales / maladies chroniques */
  conditions: string[];

  /** Médicaments réguliers */
  medications: string[];

  /** Notes médicales additionnelles */
  notes?: string;
}

/**
 * Document profil enfant dans Firestore (collection: profiles)
 */
export interface ProfileDocument {
  /** ID unique du profil */
  id: string;

  /** ID du compte parent propriétaire (Firebase Auth UID) */
  parentId: string;

  /** Nom complet de l'enfant */
  fullName: string;

  /** Date de naissance de l'enfant */
  dateOfBirth: Timestamp | null;

  /** URL de la photo de profil (Firebase Storage) */
  photoUrl: string | null;

  /** Informations médicales */
  medicalInfo: MedicalInfo;

  /** Code PIN à 4 chiffres pour accès médecin */
  doctorPin: string;

  /** Code PIN à 4 chiffres pour contrôle sortie école (PHASE 8) */
  schoolPin?: string;

  /** Liste des contacts d'urgence */
  emergencyContacts: EmergencyContact[];

  /** ID du bracelet actuellement lié (null si aucun) */
  currentBraceletId: string | null;

  /** Statut du profil */
  status: ProfileStatus;

  /** Date de création du profil */
  createdAt: Timestamp;

  /** Date de dernière mise à jour */
  updatedAt: Timestamp;
}

/**
 * Type pour les données du profil après récupération Firestore
 */
export type ProfileData = Partial<ProfileDocument> & {
  id: string;
  parentId: string;
  fullName: string;
  status: ProfileStatus;
};

/**
 * Données pour création d'un nouveau profil (formulaire)
 */
export interface CreateProfileData {
  fullName: string;
  dateOfBirth?: Date;
  photoFile?: File;
  bloodType: BloodType;
  allergies: string[];
  conditions: string[];
  medications: string[];
  medicalNotes?: string;
  doctorPin: string;
  emergencyContacts: Omit<EmergencyContact, 'priority'>[];
}

/**
 * PHASE 8 - TYPES SCHOOL PICKUP
 *
 * Types pour la gestion des sorties d'école
 */

/**
 * Type de pass de récupération
 */
export type PickupType = 'PERMANENT' | 'TEMPORARY';

/**
 * Document récupérateur dans Firestore (sous-collection: profiles/{profileId}/pickups)
 */
export interface PickupDocument {
  /** ID unique du récupérateur */
  id: string;

  /** Nom complet du récupérateur */
  name: string;

  /** Relation avec l'enfant (ex: "Oncle", "Chauffeur", "Voisin") */
  relation: string;

  /** URL de la photo du visage (Firebase Storage) */
  photoUrl: string;

  /** Type de pass */
  type: PickupType;

  /** Date d'expiration si pass temporaire */
  expiresAt?: Timestamp | null;

  /** Date de création */
  createdAt: Timestamp;
}

/**
 * Données pour création d'un nouveau récupérateur (formulaire)
 */
export interface CreatePickupData {
  name: string;
  relation: string;
  photoFile: File;
  type: PickupType;
  expiresAt?: Date;
}
