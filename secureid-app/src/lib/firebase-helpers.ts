/**
 * FIREBASE HELPERS
 *
 * Utilitaires pour travailler avec Firestore
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Vérifie si une valeur est un Timestamp Firestore (Client SDK ou Admin SDK)
 */
function isTimestamp(value: any): boolean {
  // Client SDK: instance de Timestamp de firebase/firestore
  if (value instanceof Timestamp) {
    return true;
  }

  // Admin SDK: objet avec _seconds et _nanoseconds
  if (
    value &&
    typeof value === 'object' &&
    '_seconds' in value &&
    '_nanoseconds' in value
  ) {
    return true;
  }

  return false;
}

/**
 * Convertit un Timestamp en Date
 */
function timestampToDate(timestamp: any): Date {
  // Client SDK
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }

  // Admin SDK
  if (timestamp._seconds !== undefined) {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  }

  return new Date();
}

/**
 * Sérialise les données Firestore pour Next.js
 * Convertit les Timestamps (Client SDK et Admin SDK) en strings ISO
 */
export function serializeFirestoreData<T extends Record<string, any>>(data: T): T {
  const serialized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (isTimestamp(value)) {
      serialized[key] = timestampToDate(value).toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      serialized[key] = serializeFirestoreData(value);
    } else {
      serialized[key] = value;
    }
  }

  return serialized as T;
}
