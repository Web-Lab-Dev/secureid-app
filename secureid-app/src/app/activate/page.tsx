import { ActivatePageClient } from './page-client';

/**
 * PHASE 3B - PAGE D'ACTIVATION (SERVER COMPONENT)
 *
 * Page affichée quand un bracelet INACTIVE est scanné
 * Route: /activate?id={slug}&token={token}
 *
 * Cette version intègre l'authentification Firebase
 */

interface ActivatePageProps {
  searchParams: Promise<{
    id?: string;
    token?: string;
  }>;
}

export default async function ActivatePage({ searchParams }: ActivatePageProps) {
  const { id, token } = await searchParams;

  // Vérifier que les paramètres requis sont présents
  if (!id || !token) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">⚠️ Paramètres manquants</h1>
            <p className="text-gray-300">
              Cette page nécessite un ID de bracelet et un token valide.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <ActivatePageClient braceletId={id} token={token} />;
}
