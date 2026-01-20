'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * Global Error Boundary pour Next.js App Router
 * Capture toutes les erreurs React non gérées
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur complète pour debugging
    logger.error('Global error boundary caught error', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });

    // Log détaillé dans console pour investigation
    console.error('🔴 CRASH INTERCEPTÉ PAR ERROR BOUNDARY:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      fullError: error,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white border-2 border-red-500 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600">
            Erreur Détectée
          </h2>
        </div>

        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Message d'erreur :</p>
          <p className="text-sm font-mono text-red-900 break-all">
            {error.message}
          </p>
        </div>

        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 mb-2">
            🔍 Voir la stack trace complète (pour debugging)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 border border-gray-300">
            {error.stack}
          </pre>
        </details>

        {error.digest && (
          <div className="mb-4 text-xs text-gray-500">
            <p>Error Digest: <code className="bg-gray-100 px-2 py-1 rounded">{error.digest}</code></p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-semibold transition-colors"
          >
            🔄 Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-semibold transition-colors"
          >
            🏠 Retour Accueil
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Astuce :</strong> Ouvrez la console du navigateur (F12) pour voir les détails complets de l'erreur.
          </p>
        </div>
      </div>
    </div>
  );
}
