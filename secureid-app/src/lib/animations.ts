/**
 * NIVEAU 2 - Animations centralisées et optimisées
 *
 * Configurations d'animations réutilisables pour éviter la duplication
 * et améliorer les performances avec will-change CSS
 */

import { Variants } from 'framer-motion';

/**
 * Viewport config optimisé - réduit les recalculs
 */
export const optimizedViewport = {
  once: true,
  margin: '-50px', // Trigger légèrement avant l'entrée dans le viewport
  amount: 0.3, // Trigger quand 30% visible (au lieu de 50% par défaut)
};

/**
 * Animation fade-in simple (la plus courante)
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Animation fade-in + slide from bottom
 */
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  },
};

/**
 * Animation fade-in + slide from left
 */
export const fadeInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8 }
  },
};

/**
 * Animation fade-in + slide from right
 */
export const fadeInRightVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8 }
  },
};

/**
 * Animation scale (zoom in)
 */
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8 }
  },
};

/**
 * Animation pour éléments de liste avec délai progressif
 */
export const staggerItemVariants = (index: number): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.1
    }
  },
});

/**
 * Animation floating (hover effect)
 */
export const floatAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Classes CSS optimisées avec will-change
 * À appliquer sur les éléments animés pour améliorer les performances
 */
export const performanceClasses = {
  // Pour les animations d'opacité
  fadeElement: 'will-change-[opacity]',
  // Pour les animations de transformation (translate, scale, rotate)
  transformElement: 'will-change-[transform]',
  // Pour les animations combinées
  animatedElement: 'will-change-[transform,opacity]',
};

/**
 * Hook de configuration globale pour motion
 * Désactive les animations si l'utilisateur préfère reduced-motion
 */
export const globalMotionConfig = {
  reducedMotion: 'user',
};
