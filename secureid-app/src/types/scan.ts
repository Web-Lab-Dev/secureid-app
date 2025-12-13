import type { Timestamp } from 'firebase/firestore';

/**
 * PHASE 5 - SCAN TRACKING
 *
 * Types pour l'enregistrement des scans de bracelets
 * (géolocalisation, tracking, notifications futures)
 */

export interface ScanDocument {
  /** ID unique du document scan dans Firestore */
  id: string;

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

  /** Type d'appareil (mobile, tablet, desktop) */
  deviceType?: string;

  /** Nom du navigateur (Chrome, Safari, Firefox) */
  browser?: string;

  /** Système d'exploitation (Android, iOS, Windows) */
  os?: string;

  /** Ville approximative (basée sur IP ou GPS) */
  city?: string;

  /** Pays (basé sur IP ou GPS) */
  country?: string;

  /** Statut de lecture par le parent */
  isRead?: boolean;
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
