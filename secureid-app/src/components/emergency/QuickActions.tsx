'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin, Stethoscope, Loader2, AlertCircle } from 'lucide-react';
import { ShareLocationModal } from './ShareLocationModal';
import type { ProfileDocument } from '@/types/profile';
import type { UseGeolocationReturn } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';

/**
 * PHASE 5 + 6.5 - QUICK ACTIONS
 *
 * Boutons d'action rapide sticky en bas de page:
 * - Appeler le contact d'urgence principal
 * - Envoyer position GPS (PHASE 6.5: multi-canal avec modal)
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
  const [showShareModal, setShowShareModal] = useState(false);

  const handleRequestLocation = () => {
    if (geolocation.isLoading) return;

    // Si on a déjà la position, ouvrir le modal
    if (geolocation.data) {
      setShowShareModal(true);
    } else {
      // Sinon, récupérer la position d'abord
      geolocation.requestLocation();
    }
  };

  // Ouvrir automatiquement le modal quand la position est récupérée
  useEffect(() => {
    if (geolocation.data && !geolocation.isLoading && !geolocation.error) {
      setShowShareModal(true);
    }
  }, [geolocation.data, geolocation.isLoading, geolocation.error]);

  return (
    <>
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-brand-black/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-2xl px-4 py-4">
        {/* Message GPS si succès */}
        {geolocation.data && (
          <div className="mb-3 rounded-lg bg-green-500/10 border border-green-500/30 p-2 text-center">
            <p className="text-sm text-green-500">
              ✓ Position GPS trouvée - Choisissez comment la transmettre
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

          {/* Bouton 2: Position GPS (PHASE 6.5) */}
          <Button
            onClick={handleRequestLocation}
            disabled={geolocation.isLoading}
            variant="primary"
            className="flex flex-col gap-2 py-4"
          >
            {geolocation.isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <MapPin className="h-6 w-6" />
            )}
            <span className="text-sm">
              {geolocation.data ? 'Partager Position' : 'Envoyer Position'}
            </span>
          </Button>

          {/* Bouton 3: Accès Médecin */}
          <Button
            onClick={onOpenMedicalPortal}
            variant="info"
            className="flex flex-col gap-2 py-4"
          >
            <Stethoscope className="h-6 w-6" />
            <span className="text-sm">Accès Médecin</span>
          </Button>
        </div>
      </div>
    </div>

    {/* Modal de partage (PHASE 6.5) */}
    {geolocation.data && primaryContact && (
      <ShareLocationModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        location={geolocation.data}
        contactPhone={primaryContact.phone}
      />
    )}
    </>
  );
}
