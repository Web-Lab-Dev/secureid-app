/**
 * Hook pour détecter si l'utilisateur préfère les animations réduites
 * Respecte la préférence système prefers-reduced-motion
 * Conformité WCAG 2.1 (2.3.3 Animation from Interactions)
 */

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Vérifier si le media query est supporté
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set l'état initial
    setShouldReduceMotion(mediaQuery.matches);

    // Écouter les changements
    const handleChange = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy browsers (Safari < 14)
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return shouldReduceMotion;
}
