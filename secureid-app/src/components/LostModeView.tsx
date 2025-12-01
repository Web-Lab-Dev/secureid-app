'use client';

import { Phone, MessageCircle, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { BraceletDocument } from '@/types/bracelet';

/**
 * PHASE 6.5 - LOST MODE VIEW
 *
 * Écran de restitution pour bracelet déclaré perdu
 *
 * SÉCURITÉ:
 * - NE PAS afficher photo/données enfant (protection prédateurs)
 * - Afficher seulement moyen de contact propriétaire
 *
 * DESIGN:
 * - Fond rouge sombre (alerte)
 * - Icône cadenas/stop
 * - Boutons appel et WhatsApp
 */

interface LostModeViewProps {
  bracelet: BraceletDocument;
  ownerPhone?: string;
}

export function LostModeView({ bracelet, ownerPhone }: LostModeViewProps) {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le numéro du propriétaire depuis Firestore
    // TODO: Passer via props depuis le server component
    if (ownerPhone) {
      setPhone(ownerPhone);
    }
  }, [ownerPhone]);

  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (phone) {
      const message = encodeURIComponent(
        `Bonjour, j'ai trouvé votre bracelet SecureID (${bracelet.id}). Je souhaite vous le restituer.`
      );
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-red-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icône d'alerte */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-red-600/20 p-8 border-4 border-red-500">
            <ShieldAlert className="w-16 h-16 text-red-500" strokeWidth={2} />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          BRACELET DÉCLARÉ PERDU
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-200 mb-3">
          Le propriétaire a signalé la perte de ce dispositif de sécurité.
        </p>
        <p className="text-md text-gray-300 mb-8">
          Merci d'aider à sa restitution en contactant le propriétaire.
        </p>

        {/* ID du bracelet */}
        <div className="mb-8 bg-black/30 rounded-lg p-4 border border-red-500/30">
          <p className="text-sm text-gray-400 mb-1">Référence</p>
          <p className="text-xl font-mono font-bold text-white">{bracelet.id}</p>
        </div>

        {/* Boutons de contact */}
        <div className="space-y-3">
          {/* Bouton Appeler */}
          <button
            onClick={handleCall}
            disabled={!phone}
            className="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Phone className="w-6 h-6" />
            <span className="text-lg">APPELER LE PROPRIÉTAIRE</span>
          </button>

          {/* Bouton WhatsApp */}
          <button
            onClick={handleWhatsApp}
            disabled={!phone}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg">CONTACTER SUR WHATSAPP</span>
          </button>
        </div>

        {/* Message de remerciement */}
        <div className="mt-8 text-sm text-gray-400">
          <p>🙏 Merci de votre aide pour retrouver ce bracelet</p>
        </div>

        {/* Note de confidentialité */}
        <div className="mt-6 bg-black/20 rounded-lg p-4 border border-red-500/20">
          <p className="text-xs text-gray-400">
            🔒 Par mesure de sécurité, les informations personnelles ne sont pas affichées.
          </p>
        </div>
      </div>
    </div>
  );
}
