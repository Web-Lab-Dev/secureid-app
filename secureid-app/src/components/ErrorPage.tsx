import { ShieldAlert, AlertTriangle, ShieldX } from 'lucide-react';

/**
 * PHASE 2 - ÉTAPE 3: COMPOSANTS UI D'ERREUR
 *
 * Composants réutilisables pour afficher les différents types d'erreurs
 * de scan de bracelets de manière professionnelle
 */

type ErrorType = 'not-found' | 'counterfeit' | 'stolen';

interface ErrorPageProps {
  type: ErrorType;
  slug?: string;
  token?: string;
}

export function ErrorPage({ type, slug, token }: ErrorPageProps) {
  // Configuration selon le type d'erreur
  const config = {
    'not-found': {
      icon: ShieldX,
      title: 'BRACELET NON RECONNU',
      subtitle: 'Ce bracelet n\'est pas enregistré dans notre système',
      description: 'Si vous avez acheté ce bracelet récemment, contactez le service client.',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      animation: '',
    },
    'counterfeit': {
      icon: ShieldAlert,
      title: 'ALERTE SÉCURITÉ',
      subtitle: 'QR CODE NON AUTHENTIQUE',
      description: 'Ce bracelet n\'a pas pu être authentifié. Il pourrait s\'agir d\'une contrefaçon.',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      animation: 'animate-pulse',
    },
    'stolen': {
      icon: AlertTriangle,
      title: 'BRACELET SIGNALÉ',
      subtitle: 'Ce bracelet a été déclaré perdu ou volé',
      description: 'Cette tentative d\'accès a été enregistrée et le propriétaire en sera informé.',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500',
      iconColor: 'text-orange-500',
      animation: 'animate-pulse',
    },
  };

  const { icon: Icon, title, subtitle, description, bgColor, borderColor, iconColor, animation } = config[type];

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
          {type === 'counterfeit' ? '🚨' : type === 'stolen' ? '⚠️' : '⛔'} {title}
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

          {type === 'not-found' && (
            <div className="pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-xs">
                💡 Ce code pourrait ne pas avoir été activé ou ne fait pas partie de notre catalogue.
              </p>
            </div>
          )}

          {type === 'counterfeit' && (
            <div className="pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-xs">
                ⚠️ Pour votre sécurité, seuls les bracelets authentiques SecureID sont acceptés.
              </p>
            </div>
          )}

          {type === 'stolen' && (
            <div className="pt-3 border-t border-gray-700">
              <p className="text-gray-400 text-xs">
                📍 Localisation et horodatage enregistrés pour la sécurité du propriétaire.
              </p>
            </div>
          )}
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
