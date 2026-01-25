'use client';

import { useState, useEffect } from 'react';
import { MapPin, Stethoscope, Loader2, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';
import { ShareLocationModal } from './ShareLocationModal';
import type { UseGeolocationReturn } from '@/hooks/useGeolocation';
import type { ProfileDocument } from '@/types/profile';
import { Button } from '@/components/ui/button';

/**
 * PHASE 5 V2 + 6.5 + 8 - ACTIONS FOOTER
 *
 * Pied de page avec actions secondaires (dans le flux scroll):
 * - Bouton GPS (large, orange) avec modal de partage multi-canal
 * - Bouton Contrôle École (outline, indigo) - PHASE 8
 * - Bouton Portail Médecin (outline, bleu, discret)
 */

interface ActionsFooterProps {
  profile: ProfileDocument;
  geolocation: UseGeolocationReturn;
  onOpenMedicalPortal: () => void;
  onOpenSchoolPortal: () => void;
}

export function ActionsFooter({ profile, geolocation, onOpenMedicalPortal, onOpenSchoolPortal }: ActionsFooterProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const primaryContact = profile.emergencyContacts[0];

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
      <div className="space-y-4">
        {/* Message GPS - Succès */}
        {geolocation.data && (
          <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] backdrop-blur-sm">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-500">Position GPS trouvée</p>
              <p className="text-xs text-green-400/80">
                Choisissez comment la transmettre
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
        <Button
          onClick={handleRequestLocation}
          disabled={geolocation.isLoading}
          variant="primary"
          size="lg"
          fullWidth
        >
          {geolocation.isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Localisation en cours...</span>
            </>
          ) : geolocation.data ? (
            <>
              <MapPin className="h-5 w-5" />
              <span>Partager Position</span>
            </>
          ) : (
            <>
              <MapPin className="h-5 w-5" />
              <span>Envoyer ma Position GPS</span>
            </>
          )}
        </Button>

        {/* Bouton Contrôle École - Design Enfantin Bleu Ciel */}
        <Button
          onClick={onOpenSchoolPortal}
          variant="outline"
          size="md"
          fullWidth
          className="border-2 border-school-sky text-school-sky hover:bg-school-sky/10 hover:border-school-yellow hover:shadow-lg hover:shadow-school-sky/20 rounded-xl transition-all"
        >
          <GraduationCap className="h-5 w-5" />
          <span>Contrôle Sortie École 🏫</span>
        </Button>

        {/* Bouton Portail Médecin - Design Apaisant Menthe */}
        <Button
          onClick={onOpenMedicalPortal}
          variant="outline"
          size="md"
          fullWidth
          className="border-2 border-health-mint text-health-mint hover:bg-health-mint/10 hover:border-health-teal hover:shadow-lg hover:shadow-health-mint/20 rounded-xl transition-all"
        >
          <Stethoscope className="h-5 w-5" />
          <span>Accès Personnel Médical 🩺</span>
        </Button>

        {/* Note de confidentialité */}
        <p className="text-center text-xs text-slate-500">
          Les portails sont protégés par code PIN
        </p>
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
