'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Page Offline - Affichée quand l'utilisateur n'a pas de connexion
 * Design cohérent avec le thème enfance de l'app
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Vérifier l'état de connexion
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Si connexion rétablie, proposer de revenir
  if (isOnline) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4 text-center">
        <div className="rounded-full bg-green-500/20 p-6 mb-6">
          <WifiOff className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Connexion rétablie !
        </h1>
        <p className="text-slate-400 mb-8 max-w-sm">
          Votre connexion Internet est de retour. Vous pouvez continuer à utiliser SecureID.
        </p>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 font-semibold text-white transition-all hover:bg-brand-orange/90 hover:scale-105"
        >
          <Home className="h-5 w-5" />
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-4 text-center">
      {/* Icône animée */}
      <div className="rounded-full bg-orange-500/20 p-6 mb-6 animate-pulse">
        <WifiOff className="h-12 w-12 text-orange-500" />
      </div>

      {/* Titre */}
      <h1 className="text-2xl font-bold text-white mb-2">
        Pas de connexion
      </h1>

      {/* Description */}
      <p className="text-slate-400 mb-8 max-w-sm">
        Il semble que vous n&apos;ayez pas de connexion Internet.
        Vérifiez votre réseau et réessayez.
      </p>

      {/* Message rassurant */}
      <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-4 max-w-sm">
        <p className="text-sm text-slate-300">
          <span className="text-soft-pink font-semibold">Rassurez-vous</span> —
          Les données essentielles de vos enfants sont sauvegardées localement
          et seront synchronisées dès que la connexion sera rétablie.
        </p>
      </div>

      {/* Bouton de rafraîchissement */}
      <button
        onClick={handleRefresh}
        className="flex items-center gap-2 rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-600 active:scale-95"
      >
        <RefreshCw className="h-5 w-5" />
        Réessayer
      </button>

      {/* Footer */}
      <p className="mt-12 text-xs text-slate-600">
        SecureID — Protection invisible pour vos enfants
      </p>
    </div>
  );
}
