/**
 * Configuration des animations Framer Motion
 * Centralisation des durées, delays et transitions
 */

export const ANIMATION_CONFIG = {
  // Durées standard
  durations: {
    fast: 0.3,
    normal: 0.6,
    slow: 0.8,
    floating: 4,
    scrollIndicator: 1.5,
  },

  // Delays pour la hero section
  delays: {
    hero: {
      initial: 0.3,
      titleLine1: 0.5,
      titleLine2: 0.8,
      subtitle: 1.1,
      cta: 1.4,
      scrollIndicator: 2,
    },
    // Fonction helper pour générer des delays progressifs
    stagger: (index: number, baseDelay = 0.1) => index * baseDelay + baseDelay,
  },

  // Configuration viewport pour animations au scroll
  viewport: {
    once: true,
    margin: '-100px',
  },

  // Transitions standard
  transitions: {
    default: { duration: 0.6 },
    slow: { duration: 0.8 },
    floating: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
    heartbeat: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
    scrollIndicator: {
      duration: 1.5,
      repeat: Infinity,
    },
  },

  // Variants d'animation réutilisables
  variants: {
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
    },
    fadeInRight: {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
    },
  },
} as const;
