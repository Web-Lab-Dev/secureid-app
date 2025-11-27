import { ShieldAlert, AlertTriangle, ShieldX, Settings, LucideIcon } from 'lucide-react';

/**
 * PHASE 2.1 - OPTIMISATION: CONFIGURATION EXTERNALISÉE
 *
 * Configuration centralisée des messages d'erreur pour faciliter
 * la maintenance et les traductions futures
 */

export type ErrorType = 'not-found' | 'counterfeit' | 'stolen' | 'factory-locked';

export interface ErrorConfig {
  /** Icône Lucide React à afficher */
  icon: LucideIcon;

  /** Émoji à afficher dans le titre */
  emoji: string;

  /** Titre principal de l'erreur */
  title: string;

  /** Sous-titre explicatif */
  subtitle: string;

  /** Description détaillée (optionnelle) */
  description: string;

  /** Classe Tailwind pour la couleur de fond */
  bgColor: string;

  /** Classe Tailwind pour la couleur de bordure */
  borderColor: string;

  /** Classe Tailwind pour la couleur de l'icône */
  iconColor: string;

  /** Classe d'animation (ex: 'animate-pulse') */
  animation: string;

  /** Message contextuel additionnel */
  contextualMessage: string;
}

/**
 * Configuration des différents types d'erreurs
 */
export const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  'not-found': {
    icon: ShieldX,
    emoji: '⛔',
    title: 'BRACELET NON RECONNU',
    subtitle: 'Ce bracelet n\'est pas enregistré dans notre système',
    description: 'Si vous avez acheté ce bracelet récemment, contactez le service client.',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500',
    iconColor: 'text-red-500',
    animation: '',
    contextualMessage: '💡 Ce code pourrait ne pas avoir été activé ou ne fait pas partie de notre catalogue.',
  },

  'counterfeit': {
    icon: ShieldAlert,
    emoji: '🚨',
    title: 'ALERTE SÉCURITÉ',
    subtitle: 'QR CODE NON AUTHENTIQUE',
    description: 'Ce bracelet n\'a pas pu être authentifié. Il pourrait s\'agir d\'une contrefaçon.',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500',
    iconColor: 'text-red-500',
    animation: 'animate-pulse',
    contextualMessage: '⚠️ Pour votre sécurité, seuls les bracelets authentiques SecureID sont acceptés.',
  },

  'stolen': {
    icon: AlertTriangle,
    emoji: '⚠️',
    title: 'BRACELET SIGNALÉ',
    subtitle: 'Ce bracelet a été déclaré perdu ou volé',
    description: 'Cette tentative d\'accès a été enregistrée et le propriétaire en sera informé.',
    bgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-500',
    iconColor: 'text-orange-500',
    animation: 'animate-pulse',
    contextualMessage: '📍 Localisation et horodatage enregistrés pour la sécurité du propriétaire.',
  },

  'factory-locked': {
    icon: Settings,
    emoji: '🔧',
    title: 'MAINTENANCE',
    subtitle: 'Ce bracelet n\'est pas encore disponible',
    description: 'Ce produit est en cours de préparation et sera bientôt activable.',
    bgColor: 'bg-slate-900/20',
    borderColor: 'border-slate-500',
    iconColor: 'text-slate-400',
    animation: '',
    contextualMessage: '🏭 Ce bracelet fait partie d\'un lot en transit. Il sera débloqué prochainement.',
  },
};
