/**
 * CONSTANTES GPS
 *
 * Configuration par défaut pour les fonctionnalités GPS
 */

import type { SafeZoneConfig, TrajectoryConfig } from '@/lib/types/gps';

/**
 * Configuration par défaut de la zone de sécurité
 */
export const DEFAULT_SAFE_ZONE: Omit<SafeZoneConfig, 'center'> = {
  enabled: true,
  radius: 500, // 500 mètres
  color: '#22c55e', // Vert (green-500)
  strokeColor: '#16a34a', // Vert foncé (green-600)
};

/**
 * Configuration par défaut de l'historique de trajet
 */
export const DEFAULT_TRAJECTORY: TrajectoryConfig = {
  enabled: true,
  maxPoints: 50, // ~4 minutes à raison de 1 point toutes les 5 secondes
  color: '#3b82f6', // Bleu (blue-500)
  opacity: 0.6,
};

/**
 * Couleurs pour les types de POI
 */
export const POI_COLORS = {
  HOME: '#ef4444', // Rouge (red-500)
  SCHOOL: '#3b82f6', // Bleu (blue-500)
  DOCTOR: '#8b5cf6', // Violet (violet-500)
  CUSTOM: '#f59e0b', // Orange (amber-500)
} as const;

/**
 * Icons SVG pour les POI
 */
export const POI_ICONS = {
  HOME: '🏠',
  SCHOOL: '🏫',
  DOCTOR: '🏥',
  CUSTOM: '📍',
} as const;

/**
 * Génère un SVG marker pour un POI
 */
export function generatePoiSvg(type: keyof typeof POI_COLORS, emoji: string): string {
  const color = POI_COLORS[type];

  return `
    <svg width="40" height="52" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
      <!-- Pin principal -->
      <path
        d="M20 0C8.95 0 0 8.95 0 20c0 15 20 32 20 32s20-17 20-32C40 8.95 31.05 0 20 0z"
        fill="${color}"
        stroke="white"
        stroke-width="2"
      />
      <!-- Cercle intérieur -->
      <circle cx="20" cy="20" r="10" fill="white" opacity="0.9"/>
      <!-- Emoji (simulé par texte) -->
      <text
        x="20"
        y="26"
        font-size="16"
        text-anchor="middle"
        fill="#1f2937"
      >${emoji}</text>
    </svg>
  `.trim();
}
