/**
 * BRACELET HELPERS - P2 FIX
 *
 * Utilitaires centralisés pour la gestion des bracelets
 * Évite la duplication de logique dans les composants
 */

import type { BraceletStatus } from '@/types/bracelet';

/**
 * Configuration des badges de statut bracelet
 */
export const BRACELET_STATUS_CONFIG = {
  FACTORY_LOCKED: {
    variant: 'factory' as const,
    label: 'En usine',
    color: 'gray',
    description: 'Bracelet verrouillé en usine, non débloqué',
  },
  INACTIVE: {
    variant: 'inactive' as const,
    label: 'Inactif',
    color: 'yellow',
    description: 'Bracelet débloqué mais pas encore lié à un profil',
  },
  ACTIVE: {
    variant: 'active' as const,
    label: 'Actif',
    color: 'green',
    description: 'Bracelet lié et actif',
  },
  LOST: {
    variant: 'lost' as const,
    label: 'Perdu',
    color: 'orange',
    description: 'Bracelet déclaré perdu',
  },
  STOLEN: {
    variant: 'stolen' as const,
    label: 'Volé',
    color: 'red',
    description: 'Bracelet déclaré volé',
  },
  DEACTIVATED: {
    variant: 'deactivated' as const,
    label: 'Désactivé',
    color: 'gray',
    description: 'Bracelet désactivé (remplacé)',
  },
} as const;

/**
 * Obtient la configuration d'un statut de bracelet
 *
 * @param status - Statut du bracelet
 * @returns Configuration (variant, label, color, description)
 */
export function getBraceletStatusConfig(status: BraceletStatus) {
  return BRACELET_STATUS_CONFIG[status];
}

/**
 * Obtient le variant de badge pour un statut
 *
 * @param status - Statut du bracelet
 * @returns Variant (active, lost, stolen, etc.)
 */
export function getBraceletBadgeVariant(status: BraceletStatus) {
  return BRACELET_STATUS_CONFIG[status].variant;
}

/**
 * Obtient le label traduit pour un statut
 *
 * @param status - Statut du bracelet
 * @returns Label en français (Actif, Perdu, etc.)
 */
export function getBraceletStatusLabel(status: BraceletStatus): string {
  return BRACELET_STATUS_CONFIG[status].label;
}

/**
 * Vérifie si un bracelet peut être lié à un profil
 *
 * @param status - Statut du bracelet
 * @returns true si le bracelet peut être lié
 */
export function canLinkBracelet(status: BraceletStatus): boolean {
  return status === 'INACTIVE';
}

/**
 * Vérifie si un bracelet peut être déclaré perdu/volé
 *
 * @param status - Statut du bracelet
 * @returns true si le bracelet peut être déclaré
 */
export function canReportBracelet(status: BraceletStatus): boolean {
  return status === 'ACTIVE';
}

/**
 * Obtient les statuts disponibles pour un changement de statut
 *
 * @param currentStatus - Statut actuel du bracelet
 * @returns Array de statuts disponibles
 */
export function getAvailableStatusTransitions(
  currentStatus: BraceletStatus
): BraceletStatus[] {
  switch (currentStatus) {
    case 'FACTORY_LOCKED':
      return ['INACTIVE'];
    case 'INACTIVE':
      return ['ACTIVE'];
    case 'ACTIVE':
      return ['LOST', 'STOLEN', 'DEACTIVATED'];
    case 'LOST':
      return ['ACTIVE', 'STOLEN'];
    case 'STOLEN':
      return ['ACTIVE'];
    case 'DEACTIVATED':
      return []; // Cannot change status
    default:
      return [];
  }
}
