/**
 * FIREBASE HELPERS
 *
 * Utilitaires pour travailler avec Firestore
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Sérialise les données Firestore pour Next.js
 * Convertit les Timestamps en strings ISO
 */
export function serializeFirestoreData<T extends Record<string, any>>(data: T): T {
  const serialized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      serialized[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      serialized[key] = serializeFirestoreData(value);
    } else {
      serialized[key] = value;
    }
  }

  return serialized as T;
}
