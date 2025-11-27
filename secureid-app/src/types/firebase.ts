import { Timestamp, FieldValue } from 'firebase/firestore';

/**
 * Type pour les timestamps Firestore
 * Peut être soit un Timestamp (lecture) soit un FieldValue (écriture avec serverTimestamp())
 */
export type FirestoreTimestamp = Timestamp | FieldValue;

/**
 * Type guard pour vérifier si une valeur est un Timestamp Firestore
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return value instanceof Timestamp;
}

/**
 * Convertit un FirestoreTimestamp en Date JavaScript
 * Retourne null si ce n'est pas un Timestamp valide
 */
export function timestampToDate(timestamp: FirestoreTimestamp | null | undefined): Date | null {
  if (!timestamp || !isTimestamp(timestamp)) {
    return null;
  }
  return timestamp.toDate();
}
