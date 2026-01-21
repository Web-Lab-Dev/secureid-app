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
    <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-red-500 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-red-400">
            Erreur Détectée
          </h2>
        </div>

        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-base font-bold text-red-300 mb-3">Message d'erreur :</p>
          <p className="text-lg font-mono text-white break-words">
            {error.message}
          </p>
        </div>

        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-300 hover:text-white mb-2">
            🔍 Voir la stack trace complète (pour debugging)
          </summary>
          <pre className="mt-2 text-xs bg-slate-800 text-gray-300 p-4 rounded-lg overflow-auto max-h-96 border border-slate-700">
            {error.stack}
          </pre>
        </details>

        {error.digest && (
          <div className="mb-4 text-xs text-gray-400">
            <p>Error Digest: <code className="bg-slate-800 px-2 py-1 rounded">{error.digest}</code></p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-brand-orange text-white px-4 py-3 rounded-lg hover:bg-brand-orange/90 font-semibold transition-colors text-base"
          >
            🔄 Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg hover:bg-slate-600 font-semibold transition-colors text-base"
          >
            🏠 Retour Dashboard
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>💡 Info :</strong> Cette erreur a été enregistrée. Prenez une capture d'écran du message pour le support.
          </p>
        </div>
      </div>
    </div>
  );
}
