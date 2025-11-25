import { Shield, CheckCircle2, UserPlus } from 'lucide-react';

/**
 * PHASE 2 - ÉTAPE 4: PAGE D'ACTIVATION
 *
 * Page affichée quand un bracelet INACTIVE est scanné
 * Route: /activate?id={slug}&token={token}
 *
 * Version placeholder - sera complétée dans Phase 3
 */

interface ActivatePageProps {
  searchParams: Promise<{
    id?: string;
    token?: string;
  }>;
}

export default async function ActivatePage({ searchParams }: ActivatePageProps) {
  const { id, token } = await searchParams;

  return (
    <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header avec icône */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-orange/10 mb-4">
            <Shield className="w-12 h-12 text-brand-orange" strokeWidth={2} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Activation de Bracelet
          </h1>
          <p className="text-gray-400">
            Ce bracelet est neuf et doit être activé
          </p>
        </div>

        {/* Card principale */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 md:p-8 space-y-6">
          {/* Info bracelet */}
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Bracelet détecté</p>
            <p className="text-2xl font-bold text-brand-orange font-mono">
              {id || 'ID manquant'}
            </p>
            {token && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Token: {token.substring(0, 4)}****
              </p>
            )}
          </div>

          {/* Étapes d'activation (placeholder) */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-tactical-green" />
              Prochaines étapes
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold">Créer un compte</p>
                  <p className="text-gray-400">Inscription avec email ou téléphone</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold">Profil de l'enfant</p>
                  <p className="text-gray-400">Nom, âge, informations médicales</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold">Contacts d'urgence</p>
                  <p className="text-gray-400">Ajouter parents, médecin, etc.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton principal (placeholder) */}
          <button
            disabled
            className="w-full h-14 bg-brand-orange/50 text-white rounded-lg font-semibold text-lg cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Commencer l'activation (Bientôt)
          </button>

          {/* Note temporaire */}
          <div className="bg-tactical-green/10 border border-tactical-green/30 rounded-lg p-4">
            <p className="text-sm text-tactical-green font-semibold mb-1">
              ✅ Phase 2 Complétée!
            </p>
            <p className="text-xs text-gray-400">
              Le routeur intelligent fonctionne. Le formulaire d'activation sera implémenté en Phase 3.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>SecureID - Système de Protection pour Enfants</p>
        </div>
      </div>
    </div>
  );
}
