import type { Timestamp } from 'firebase/firestore';

/**
 * SAFE ZONE TYPES
 *
 * Types pour les zones de sécurité configurables
 * Utilisées pour le geofencing et les alertes GPS
 */

export interface SafeZoneDocument {
  id: string;
  profileId: string;
  name: string;              // "Maison", "École Primaire", "Parc Municipal"
  icon: string;              // Emoji: "🏠", "🏫", "⚽", "🏥"
  center: {
    lat: number;
    lng: number;
  };
  radius: number;            // Mètres: 100-5000
  color: string;             // Hex color: "#22c55e", "#3b82f6"
  enabled: boolean;          // Toggle on/off
  alertDelay: number;        // Minutes avant alerte (1-60)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SafeZoneInput {
  name: string;
  icon: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  color: string;
  alertDelay: number;
}

export type SafeZoneFormData = Omit<SafeZoneInput, 'createdAt' | 'updatedAt'>;

// Couleurs prédéfinies pour les zones
export const SAFE_ZONE_COLORS = {
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
} as const;

// Type helper pour validation
export type SafeZoneColor = keyof typeof SAFE_ZONE_COLORS;
