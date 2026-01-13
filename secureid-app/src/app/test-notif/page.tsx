'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { sendEmergencyScanNotification } from '@/actions/notification-actions';

/**
 * PAGE DE TEST - Notifications Push
 *
 * Cette page permet de déclencher manuellement une notification
 * pour tester si le système fonctionne.
 *
 * À SUPPRIMER après avoir vérifié que les notifications fonctionnent.
 */

export default function TestNotifPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTestNotification = async () => {
    if (!user) {
      setResult('❌ Vous devez être connecté');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // console.log('🔔 Envoi de la notification test...');
      // console.log('User ID:', user.uid);

      const res = await sendEmergencyScanNotification(
        user.uid,
        'Enfant Test',
        'Paris, France'
      );

      // console.log('✅ Résultat:', res);

      if (res.success) {
        setResult('✅ Notification envoyée! Vérifiez votre téléphone en veille dans 5-10 secondes.');
      } else {
        setResult(`❌ Échec: ${res.error}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('❌ Erreur:', error);
      setResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLocalNotification = () => {
    if (!('Notification' in window)) {
      setResult('❌ Notifications non supportées par ce navigateur');
      return;
    }

    if (Notification.permission !== 'granted') {
      setResult('❌ Permission notifications refusée. Activez dans /dashboard d\'abord.');
      return;
    }

    try {
      new Notification('🧪 Test Notification Locale', {
        body: 'Si vous voyez ceci même téléphone en veille, les notifications locales fonctionnent!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        requireInteraction: true,
        tag: 'test-local',
      });

      setResult('✅ Notification locale créée. Vérifiez si elle s\'affiche sur l\'écran de verrouillage.');
    } catch (error) {
      setResult(`❌ Erreur notification locale: ${error instanceof Error ? error.message : 'Erreur'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Test Notifications Push</h1>

        {!user ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p>⚠️ Vous devez être connecté pour tester les notifications.</p>
            <a href="/login" className="text-blue-600 underline">
              Se connecter
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded">
              <h2 className="font-bold mb-2">Connecté en tant que:</h2>
              <p className="text-sm font-mono">{user.uid}</p>
            </div>

            <div className="space-y-3">
              <h2 className="font-bold text-lg">Test 1: Notification Locale (sans FCM)</h2>
              <p className="text-sm text-gray-600">
                Teste si votre navigateur peut afficher des notifications en arrière-plan,
                sans passer par Firebase Cloud Messaging.
              </p>
              <button
                onClick={handleTestLocalNotification}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🧪 Tester Notification Locale
              </button>
            </div>

            <div className="border-t pt-6 space-y-3">
              <h2 className="font-bold text-lg">Test 2: Notification via FCM (comme un vrai scan)</h2>
              <p className="text-sm text-gray-600">
                Envoie une vraie notification via Firebase Cloud Messaging,
                exactement comme lors d'un scan de bracelet.
              </p>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded text-sm">
                <p className="font-semibold mb-1">📱 Procédure de test:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Assurez-vous que les notifications sont activées sur /dashboard</li>
                  <li>Cliquez sur le bouton ci-dessous</li>
                  <li><strong>Verrouillez votre téléphone immédiatement</strong></li>
                  <li>Attendez 5-10 secondes</li>
                  <li>Vérifiez si la notification s'affiche sur l'écran de verrouillage</li>
                </ol>
              </div>

              <button
                onClick={handleTestNotification}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {loading ? '⏳ Envoi en cours...' : '🔔 Envoyer Notification FCM'}
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded ${
                result.startsWith('✅')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="font-mono text-sm whitespace-pre-wrap">{result}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="font-bold text-lg mb-3">Debug Info</h2>
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <span className="text-gray-600">Notification Permission:</span>{' '}
                  <span className="font-bold">
                    {typeof window !== 'undefined' && 'Notification' in window
                      ? Notification.permission
                      : 'Non disponible'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">User ID:</span>{' '}
                  <span className="font-bold">{user.uid}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.serviceWorker.getRegistrations().then(regs => {
                    // console.log('Service Workers:', regs);
                    alert(`Service Workers: ${regs.length}\n${regs.map(r => r.scope).join('\n')}`);
                  });
                }}
                className="mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Vérifier Service Workers
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded text-sm">
          <p>
            <strong>Note:</strong> Cette page est temporaire pour tester les notifications.
            Supprimez <code>src/app/test-notif/page.tsx</code> une fois les tests terminés.
          </p>
        </div>
      </div>
    </div>
  );
}
