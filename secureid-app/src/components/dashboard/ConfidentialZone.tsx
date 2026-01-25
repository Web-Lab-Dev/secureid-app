'use client';

import { useState, useEffect } from 'react';
import { Lock, Key, FileText } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { PinManagement } from './PinManagement';
import { MedicalUnavailableModal } from './MedicalUnavailableModal';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 4C - ZONE CONFIDENTIELLE
 *
 * Gestion des documents médicaux confidentiels et du code PIN médecin
 * - Upload documents PDF/Images (ordonnances, radios, carnet vaccination)
 * - Gestion code PIN médecin (voir/changer)
 */

interface ConfidentialZoneProps {
  profile: ProfileDocument;
}

export function ConfidentialZone({ profile }: ConfidentialZoneProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Afficher le modal au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfoModal(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Section PIN Médecin - Design Apaisant */}
      <div className="rounded-2xl border-2 border-health-mint/30 bg-gradient-to-br from-health-bg/40 to-emerald-950/30 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-health-mint/20 animate-soft-bounce">
            <Key className="h-6 w-6 text-health-mint" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Code PIN Médecin 🩺</h3>
            <p className="text-sm text-health-mint/70">
              Code à 4 chiffres pour accéder aux documents confidentiels
            </p>
          </div>
        </div>

        <PinManagement profile={profile} />
      </div>

      {/* Section Documents - Design Apaisant */}
      <div className="rounded-2xl border-2 border-health-teal/20 bg-gradient-to-br from-slate-900/80 to-health-bg/20 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-health-lavender/20 animate-float">
            <FileText className="h-6 w-6 text-health-lavender" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Documents Médicaux 📋</h3>
            <p className="text-sm text-health-teal/70">
              Ordonnances, radios, carnet de vaccination (PDF ou Images)
            </p>
          </div>
        </div>

        <DocumentUpload profileId={profile.id} />
      </div>

      {/* Avertissement sécurité - Design Doux */}
      <div className="flex items-start gap-3 rounded-2xl bg-health-pink/10 border-2 border-health-pink/30 p-4">
        <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-health-pink" />
        <div className="text-sm">
          <p className="font-medium text-health-pink">Zone protégée 🔒</p>
          <p className="mt-1 text-health-pink/80">
            Les documents téléchargés sont chiffrés et accessibles uniquement avec le code PIN médecin.
            Seuls vous et les professionnels de santé autorisés peuvent y accéder.
          </p>
        </div>
      </div>

      {/* Modal informatif */}
      <MedicalUnavailableModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
