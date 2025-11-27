'use client';

import { Phone, MapPin, Stethoscope, Loader2, AlertCircle } from 'lucide-react';
import type { ProfileDocument } from '@/types/profile';
import type { UseGeolocationReturn } from '@/hooks/useGeolocation';

/**
 * PHASE 5 - QUICK ACTIONS
 *
 * Boutons d'action rapide sticky en bas de page:
 * - Appeler le contact d'urgence principal
 * - Envoyer position GPS
 * - Accès Portail Médecin
 */

interface QuickActionsProps {
  profile: ProfileDocument;
  geolocation: UseGeolocationReturn;
  onOpenMedicalPortal: () => void;
}

export function QuickActions({
  profile,
  geolocation,
  onOpenMedicalPortal,
}: QuickActionsProps) {
  const primaryContact = profile.emergencyContacts[0];

  const handleRequestLocation = () => {
    if (geolocation.isLoading) return;
    geolocation.requestLocation();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-brand-black/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-2xl px-4 py-4">
        {/* Message GPS si succès */}
        {geolocation.data && (
          <div className="mb-3 rounded-lg bg-green-500/10 border border-green-500/30 p-2 text-center">
            <p className="text-sm text-green-500">
              ✓ Position GPS enregistrée - Les parents seront notifiés
            </p>
          </div>
        )}

        {/* Message GPS si erreur */}
        {geolocation.error && (
          <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/30 p-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
              <div className="text-sm text-red-500">
                <p className="font-semibold">Géolocalisation impossible</p>
                <p className="text-xs">{geolocation.error.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Bouton 1: Appeler Parent */}
          {primaryContact && (
            <a
              href={`tel:${primaryContact.phone}`}
              className="flex flex-col items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-4 font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
            >
              <Phone className="h-6 w-6" />
              <span className="text-sm">Appeler Parent</span>
            </a>
          )}

          {/* Bouton 2: Position GPS */}
          <button
            onClick={handleRequestLocation}
            disabled={geolocation.isLoading || !!geolocation.data}
            className="flex flex-col items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-4 font-semibold text-white transition-colors hover:bg-brand-orange/90 active:bg-brand-orange/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {geolocation.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <MapPin className="h-6 w-6" />
            )}
            <span className="text-sm">
              {geolocation.data ? 'Position Envoyée' : 'Envoyer Position'}
            </span>
          </button>

          {/* Bouton 3: Accès Médecin */}
          <button
            onClick={onOpenMedicalPortal}
            className="flex flex-col items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-4 font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            <Stethoscope className="h-6 w-6" />
            <span className="text-sm">Accès Médecin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
