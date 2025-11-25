import { BraceletStatus } from '@/types/bracelet';

/**
 * PHASE 2.1 - OPTIMISATION: COMPOSANT EXTRAIT
 *
 * Page affichée quand un bracelet a un statut inconnu
 * (Status qui n'est ni INACTIVE, ni ACTIVE, ni STOLEN)
 */

interface UnknownStatusPageProps {
  slug: string;
  status: BraceletStatus | string;
}

export function UnknownStatusPage({ slug, status }: UnknownStatusPageProps) {
  return (
    <div className="min-h-screen bg-brand-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-orange-500">⚠️ Status Inconnu</h1>
          <p className="text-lg mb-4">Ce bracelet a un status non reconnu.</p>
          <div className="bg-black/50 p-4 rounded mt-6 text-sm">
            <p className="text-gray-400">Bracelet: <span className="text-white font-mono">{slug}</span></p>
            <p className="text-gray-400 mt-2">Status: <span className="text-orange-400 font-mono">{status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
