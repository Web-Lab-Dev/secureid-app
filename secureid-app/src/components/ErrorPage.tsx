import { ERROR_CONFIGS, ErrorType } from '@/config/errorMessages';

/**
 * PHASE 2.1 - OPTIMISATION: COMPOSANT D'ERREUR REFACTORISÉ
 *
 * Composant réutilisable pour afficher les différents types d'erreurs
 * de scan de bracelets de manière professionnelle
 */

interface ErrorPageProps {
  type: ErrorType;
  slug?: string;
  token?: string;
}

export function ErrorPage({ type, slug, token }: ErrorPageProps) {
  // Récupérer la configuration depuis le fichier centralisé
  const config = ERROR_CONFIGS[type];
  const {
    icon: Icon,
    emoji,
    title,
    subtitle,
    description,
    bgColor,
    borderColor,
    iconColor,
    animation,
    contextualMessage
  } = config;

  return (
    <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full ${bgColor} border-2 ${borderColor} rounded-lg p-8 ${animation}`}>
        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className={`${iconColor} p-4 rounded-full bg-black/30`}>
            <Icon size={64} strokeWidth={2} />
          </div>
        </div>

        {/* Titre principal */}
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${iconColor} text-center`}>
          {emoji} {title}
        </h1>

        {/* Sous-titre */}
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-200 text-center">
          {subtitle}
        </h2>

        {/* Description additionnelle */}
        {description && (
          <p className="text-base md:text-lg text-gray-300 text-center mb-6">
            {description}
          </p>
        )}

        {/* Informations contextuelles */}
        <div className="bg-black/50 p-4 rounded mt-6 text-sm space-y-3">
          {slug && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Référence:</span>
              <span className="text-white font-mono">{slug}</span>
            </div>
          )}

          {/* Message contextuel depuis la configuration */}
          <div className="pt-3 border-t border-gray-700">
            <p className="text-gray-400 text-xs">
              {contextualMessage}
            </p>
          </div>
        </div>

        {/* Message de sécurité */}
        <div className="mt-6 p-4 bg-slate-900 rounded text-center">
          <p className="text-xs text-gray-400">
            SecureID - Système de Sécurité Actif
          </p>
        </div>
      </div>
    </div>
  );
}
