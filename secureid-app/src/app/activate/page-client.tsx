'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

// TEMPORAIRE: Version ultra-simplifiée pour debug
// On importe RIEN d'autre pour isoler le problème

interface ActivatePageClientProps {
  braceletId: string;
  token: string;
}

export function ActivatePageClient({ braceletId, token }: ActivatePageClientProps) {
  const [debugInfo, setDebugInfo] = useState<string>('Initialisation...');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDebugInfo('✅ Composant monté avec succès!');
    console.log('✅ Page d\'activation chargée:', { braceletId, token });
  }, [braceletId, token]);

  return (
    <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border-2 border-green-500 rounded-lg p-8 shadow-lg">
        {/* Version indicator */}
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
          v70a04b7-MINIMAL
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-400">
              Page d'Activation
            </h2>
            <p className="text-sm text-gray-400">Version Debug Minimale</p>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 mb-4">
          <p className="text-base font-bold text-green-300 mb-3">État:</p>
          <p className="text-lg text-white mb-4">
            {debugInfo}
          </p>

          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              <span className="font-semibold">Bracelet ID:</span>{' '}
              <span className="font-mono text-brand-orange">{braceletId}</span>
            </p>
            <p className="text-gray-300">
              <span className="font-semibold">Token:</span>{' '}
              <span className="font-mono text-xs text-gray-400">{token.substring(0, 20)}...</span>
            </p>
            <p className="text-gray-300">
              <span className="font-semibold">Monté:</span>{' '}
              <span className={mounted ? 'text-green-400' : 'text-red-400'}>
                {mounted ? '✅ Oui' : '❌ Non'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <p className="text-sm text-blue-300">
            <strong>💡 Test Debug:</strong> Si tu vois cette page, le composant se charge correctement.
            Le problème vient probablement d'un des composants importés (ProfileSelector, Auth, etc).
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/dashboard'}
          className="w-full mt-6 bg-brand-orange text-white px-4 py-3 rounded-lg hover:bg-brand-orange/90 font-semibold transition-colors"
        >
          🏠 Retour Dashboard
        </button>
      </div>
    </div>
  );
}
