import type { Timestamp } from 'firebase/firestore';

/**
 * PHASE 5 - SCAN TRACKING
 *
 * Types pour l'enregistrement des scans de bracelets
 * (géolocalisation, tracking, notifications futures)
 */

export interface ScanDocument {
  /** ID du bracelet scanné */
  braceletId: string;

  /** Horodatage du scan */
  timestamp: Timestamp;

  /** Latitude (si géolocalisation acceptée) */
  lat: number | null;

  /** Longitude (si géolocalisation acceptée) */
  lng: number | null;

  /** User agent du navigateur (pour analytics) */
  userAgent: string;

  /** IP address (optionnel, pour sécurité) */
  ipAddress?: string;
}

export interface GeolocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}
