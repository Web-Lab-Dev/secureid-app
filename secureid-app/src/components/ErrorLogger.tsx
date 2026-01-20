'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * Error Logger Component
 *
 * Capture toutes les erreurs JavaScript non gérées :
 * - Erreurs window (throw, syntax errors, etc.)
 * - Promesses rejetées non gérées
 * - Erreurs réseau
 *
 * À utiliser dans layout.tsx pour une couverture globale
 */
export function ErrorLogger() {
  useEffect(() => {
    // Capturer toutes les erreurs JavaScript globales
    const handleError = (event: ErrorEvent) => {
      const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      };

      console.error('🔴 WINDOW ERROR CAPTURED:', errorInfo);

      logger.error('Window error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
      });

      // Ne pas empêcher le comportement par défaut
      // pour que l'erreur soit aussi visible dans la console normale
    };

    // Capturer les promesses rejetées non gérées
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const rejectionInfo = {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString(),
      };

      console.error('🔴 UNHANDLED PROMISE REJECTION:', rejectionInfo);

      logger.error('Unhandled promise rejection', {
        reason: typeof event.reason === 'object'
          ? JSON.stringify(event.reason, null, 2)
          : String(event.reason),
      });
    };

    // Capturer les erreurs de chargement de ressources (images, scripts, etc.)
    const handleResourceError = (event: Event) => {
      if (event.target instanceof HTMLElement) {
        console.error('🔴 RESOURCE LOADING ERROR:', {
          tagName: event.target.tagName,
          src: event.target.getAttribute('src') || event.target.getAttribute('href'),
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Ajouter les listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleResourceError, true); // Capture phase

    // Log initial pour confirmer que le logger est actif
    console.log('✅ ErrorLogger activé - Prêt à capturer les erreurs');

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
