import { BraceletData } from '@/types/bracelet';

/**
 * PHASE 2.1 - OPTIMISATION: COMPOSANT EXTRAIT
 *
 * Placeholder pour le mode urgence (sera complété en Phase 3)
 * Affiché quand un bracelet ACTIVE est scanné
 */

interface EmergencyModePlaceholderProps {
  braceletData: BraceletData;
}

export function EmergencyModePlaceholder({ braceletData }: EmergencyModePlaceholderProps) {
  return (
    <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-10">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="text-6xl animate-pulse">🚨</div>
        <h1 className="text-4xl md:text-5xl font-bold">MODE URGENCE ACTIVÉ</h1>
        <div className="bg-black/30 p-6 rounded-lg">
          <p className="text-xl font-semibold mb-4">Profil Enfant Chargé</p>
          <div className="space-y-2 text-left text-lg">
            <p><strong>Bracelet:</strong> {braceletData.id}</p>
            <p><strong>Utilisateur lié:</strong> {braceletData.linkedUserId || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-yellow-900/50 border border-yellow-500 p-4 rounded">
          <p className="text-sm">
            ⚠️ Placeholder - Phase 2 complétée<br/>
            L&apos;interface d&apos;urgence complète sera développée en Phase 3
          </p>
        </div>
      </div>
    </div>
  );
}
