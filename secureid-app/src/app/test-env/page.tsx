'use client';

/**
 * PAGE DE TEST - Variables d'environnement
 *
 * Cette page permet de vérifier que les variables NEXT_PUBLIC_*
 * sont correctement injectées par Next.js au build time.
 *
 * À SUPPRIMER après avoir vérifié que les variables fonctionnent.
 */

export default function TestEnvPage() {
  const vars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Test Variables d'Environnement</h1>

        <div className="space-y-3">
          {Object.entries(vars).map(([key, value]) => (
            <div key={key} className="border-b pb-2">
              <div className="font-semibold text-sm text-gray-600">
                NEXT_PUBLIC_FIREBASE_{key.toUpperCase().replace('KEY', '').replace('DOMAIN', 'AUTH_DOMAIN')}
              </div>
              <div className={`font-mono text-sm ${value ? 'text-green-600' : 'text-red-600'}`}>
                {value ? (
                  <>
                    ✅ Défini: {value.substring(0, 20)}...
                  </>
                ) : (
                  <>
                    ❌ undefined (variable non injectée)
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h2 className="font-bold mb-2">Comment interpréter les résultats:</h2>
          <ul className="text-sm space-y-1">
            <li>✅ <strong>Toutes vertes</strong>: Variables correctement injectées, notifications vont fonctionner</li>
            <li>❌ <strong>Certaines rouges</strong>: Ces variables ne sont pas dans Vercel ou mal nommées</li>
            <li>❌ <strong>Toutes rouges</strong>: Next.js n'a pas injecté les variables (problème de build)</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded">
          <p className="text-sm">
            <strong>Note:</strong> Cette page est temporaire pour vérifier l'injection des variables.
            Supprimez <code>src/app/test-env/page.tsx</code> une fois les tests terminés.
          </p>
        </div>
      </div>
    </div>
  );
}
