'use client';

import { useState } from 'react';
import { Lock, Key, FileText } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { PinManagement } from './PinManagement';
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
  return (
    <div className="space-y-8">
      {/* Section PIN Médecin */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10">
            <Key className="h-5 w-5 text-brand-orange" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Code PIN Médecin</h3>
            <p className="text-sm text-slate-400">
              Code à 4 chiffres pour accéder aux documents confidentiels
            </p>
          </div>
        </div>

        <PinManagement profile={profile} />
      </div>

      {/* Section Documents */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10">
            <FileText className="h-5 w-5 text-brand-orange" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Documents Médicaux</h3>
            <p className="text-sm text-slate-400">
              Ordonnances, radios, carnet de vaccination (PDF ou Images)
            </p>
          </div>
        </div>

        <DocumentUpload profileId={profile.id} />
      </div>

      {/* Avertissement sécurité */}
      <div className="flex items-start gap-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4">
        <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
        <div className="text-sm">
          <p className="font-medium text-yellow-500">Zone protégée</p>
          <p className="mt-1 text-yellow-500/80">
            Les documents téléchargés sont chiffrés et accessibles uniquement avec le code PIN médecin.
            Seuls vous et les professionnels de santé autorisés peuvent y accéder.
          </p>
        </div>
      </div>
    </div>
  );
}
