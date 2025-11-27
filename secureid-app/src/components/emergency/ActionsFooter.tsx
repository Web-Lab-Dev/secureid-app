'use client';

import { MapPin, Stethoscope, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { UseGeolocationReturn } from '@/hooks/useGeolocation';

/**
 * PHASE 5 V2 - ACTIONS FOOTER
 *
 * Pied de page avec actions secondaires (dans le flux scroll):
 * - Bouton GPS (large, orange)
 * - Bouton Portail Médecin (outline, bleu, discret)
 */

interface ActionsFooterProps {
  geolocation: UseGeolocationReturn;
  onOpenMedicalPortal: () => void;
}

export function ActionsFooter({ geolocation, onOpenMedicalPortal }: ActionsFooterProps) {
  const handleRequestLocation = () => {
    if (geolocation.isLoading) return;
    geolocation.requestLocation();
  };

  return (
    <div className="space-y-4">
      {/* Message GPS - Succès */}
      {geolocation.data && (
        <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] backdrop-blur-sm">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-500">Position GPS enregistrée</p>
            <p className="text-xs text-green-400/80">
              Les parents seront notifiés de votre localisation
            </p>
          </div>
        </div>
      )}

      {/* Message GPS - Erreur */}
      {geolocation.error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 shadow-[0_0_20px_rgba(239,68,68,0.2)] backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-500">Géolocalisation impossible</p>
            <p className="text-xs text-red-400/80">{geolocation.error.message}</p>
          </div>
        </div>
      )}

      {/* Bouton GPS (Large, Orange) */}
      <button
        onClick={handleRequestLocation}
        disabled={geolocation.isLoading || !!geolocation.data}
        className="flex w-full items-center justify-center gap-3 rounded-lg bg-brand-orange px-6 py-4 font-semibold text-white transition-colors hover:bg-brand-orange/90 active:bg-brand-orange/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {geolocation.isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Localisation en cours...</span>
          </>
        ) : geolocation.data ? (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Position Envoyée</span>
          </>
        ) : (
          <>
            <MapPin className="h-5 w-5" />
            <span>Envoyer ma Position GPS</span>
          </>
        )}
      </button>

      {/* Bouton Portail Médecin (Outline, Bleu, Discret) */}
      <button
        onClick={onOpenMedicalPortal}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-transparent px-6 py-3 font-medium text-blue-400 transition-colors hover:bg-blue-600/10 active:bg-blue-600/20"
      >
        <Stethoscope className="h-5 w-5" />
        <span>Accès Personnel Médical 🔒</span>
      </button>

      {/* Note de confidentialité */}
      <p className="text-center text-xs text-slate-500">
        Le portail médical est protégé par code PIN
      </p>
    </div>
  );
}
