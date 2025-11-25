import { Timestamp } from 'firebase/firestore';

/**
 * PHASE 2.1 - OPTIMISATION: TYPES TYPESCRIPT
 * PHASE 3A - MISE À JOUR: Support liaison avec profils
 *
 * Interface définissant la structure d'un document bracelet dans Firestore
 */

/**
 * Statuts possibles d'un bracelet
 */
export type BraceletStatus = 'INACTIVE' | 'ACTIVE' | 'STOLEN' | 'DEACTIVATED';

/**
 * Structure d'un document bracelet dans Firestore (collection: bracelets)
 */
export interface BraceletDocument {
  /** Identifiant unique du bracelet (ex: BF-0001) */
  id: string;

  /** Token secret cryptographique pour validation anti-fraude */
  secretToken: string;

  /** Statut actuel du bracelet */
  status: BraceletStatus;

  /** Identifiant du lot de production */
  batchId: string;

  /** Date de création du bracelet (timestamp Firestore) */
  createdAt: Timestamp | null;

  /** ID de l'utilisateur lié au bracelet (null si INACTIVE) */
  linkedUserId: string | null;

  /** ID du profil enfant lié au bracelet (null si INACTIVE) - Phase 3 */
  linkedProfileId: string | null;
}

/**
 * Type pour les données du bracelet après récupération Firestore
 * (Firestore peut retourner undefined pour certains champs)
 */
export type BraceletData = Partial<BraceletDocument> & {
  id: string;
  secretToken: string;
  status: BraceletStatus;
};
