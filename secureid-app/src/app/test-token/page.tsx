'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * PAGE DE DIAGNOSTIC - Token FCM
 *
 * Vérifie si le token FCM est bien enregistré dans Firestore
 */

export default function TestTokenPage() {
  const { user } = useAuthContext();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking FCM token for user:', user.uid);

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError('❌ Document user introuvable dans Firestore');
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        console.log('📄 User data:', userData);

        setTokenInfo({
          exists: userSnap.exists(),
          hasFcmToken: !!userData?.fcmToken,
          fcmToken: userData?.fcmToken,
          fcmTokenUpdatedAt: userData?.fcmTokenUpdatedAt?.toDate?.() || userData?.fcmTokenUpdatedAt,
          email: userData?.email,
          phoneNumber: userData?.phoneNumber,
        });

        setLoading(false);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setLoading(false);
      }
    };

    checkToken();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Diagnostic Token FCM</h1>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p>⚠️ Vous devez être connecté</p>
            <a href="/login" className="text-blue-600 underline">Se connecter</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Diagnostic Token FCM</h1>

        <div className="mb-4 p-4 bg-blue-50 rounded">
          <p className="font-semibold">User ID:</p>
          <p className="font-mono text-sm">{user.uid}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>⏳ Chargement...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-mono text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded border ${
              tokenInfo?.exists
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className="font-semibold mb-2">
                {tokenInfo?.exists ? '✅ Document user existe' : '❌ Document user introuvable'}
              </p>
            </div>

            {tokenInfo?.exists && (
              <>
                <div className={`p-4 rounded border ${
                  tokenInfo?.hasFcmToken
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className="font-semibold mb-2">
                    {tokenInfo?.hasFcmToken ? '✅ Token FCM présent' : '❌ Token FCM absent'}
                  </p>

                  {tokenInfo?.hasFcmToken && (
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Token (premiers 50 chars):</p>
                        <p className="font-mono text-xs break-all bg-white p-2 rounded border">
                          {tokenInfo.fcmToken?.substring(0, 50)}...
                        </p>
                      </div>

                      {tokenInfo.fcmTokenUpdatedAt && (
                        <div>
                          <p className="text-sm text-gray-600">Dernière mise à jour:</p>
                          <p className="font-mono text-xs">
                            {tokenInfo.fcmTokenUpdatedAt instanceof Date
                              ? tokenInfo.fcmTokenUpdatedAt.toLocaleString('fr-FR')
                              : 'Date invalide'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!tokenInfo?.hasFcmToken && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                    <p className="font-semibold mb-2">🔧 Solution:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Aller sur <a href="/dashboard" className="text-blue-600 underline">/dashboard</a></li>
                      <li>Cliquer sur "Activer les notifications"</li>
                      <li>Accepter la permission</li>
                      <li>Revenir sur cette page pour vérifier</li>
                    </ol>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded border">
                  <p className="font-semibold mb-2">Autres infos:</p>
                  <div className="space-y-1 text-sm font-mono">
                    <p>Email: {tokenInfo.email || '(non défini)'}</p>
                    <p>Téléphone: {tokenInfo.phoneNumber || '(non défini)'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            🔄 Recharger
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors inline-block"
          >
            ← Retour au Dashboard
          </a>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded text-sm">
          <p>
            <strong>Note:</strong> Si le token FCM est absent, les notifications ne pourront pas être envoyées.
            Vous devez activer les notifications dans le dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
