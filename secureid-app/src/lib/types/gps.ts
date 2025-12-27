/**
 * TYPES GPS - GEOFENCING, POI, TRAJECTORY
 *
 * Types pour les nouvelles fonctionnalités GPS:
 * - Zone de sécurité (geofencing)
 * - Points d'intérêt (POI)
 * - Historique de trajet
 */

import type { LatLng } from '@/lib/geo-utils';

/**
 * Configuration de la zone de sécurité (cercle)
 */
export interface SafeZoneConfig {
  enabled: boolean;
  radius: number; // En mètres
  center: LatLng;
  color: string;
  strokeColor: string;
}

/**
 * Point d'intérêt sur la carte
 */
export interface PointOfInterest {
  id: string;
  name: string;
  position: LatLng;
  type: 'HOME' | 'SCHOOL' | 'DOCTOR' | 'CUSTOM';
  icon?: string; // Emoji ou URL
  distance?: number; // Distance depuis position enfant (calculée)
}

/**
 * Configuration de l'historique de trajet
 */
export interface TrajectoryConfig {
  enabled: boolean;
  maxPoints: number; // Nombre max de points à garder
  color: string;
  opacity: number;
}

/**
 * Point dans l'historique de trajet avec timestamp
 */
export interface TrajectoryPoint extends LatLng {
  timestamp: number;
}
