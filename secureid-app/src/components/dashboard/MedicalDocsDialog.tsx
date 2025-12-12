'use client';

import { X, FileHeart } from 'lucide-react';
import { ConfidentialZone } from './ConfidentialZone';
import type { ProfileDocument } from '@/types/profile';
import { Button } from '@/components/ui/button';

/**
 * PHASE 9 - MEDICAL DOCS DIALOG
 *
 * Modal dialog pour gérer uniquement les documents médicaux confidentiels
 * - Wraps ConfidentialZone component
 * - Full-screen modal avec scroll
 * - Protection PIN médecin maintenue
 */

interface MedicalDocsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileDocument;
}

export function MedicalDocsDialog({ isOpen, onClose, profile }: MedicalDocsDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-50 overflow-y-auto">
        <div className="min-h-full bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-6">
          {/* Header */}
          <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/20">
                <FileHeart className="h-6 w-6 text-brand-orange" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Dossier Médical Confidentiel
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {profile.fullName} • Documents protégés
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="rounded-full bg-slate-800/50 p-3 hover:bg-slate-700"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Contenu - ConfidentialZone */}
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
              <ConfidentialZone profile={profile} />
            </div>
          </div>

          {/* Footer info */}
          <div className="mx-auto mt-6 max-w-4xl rounded-lg border border-slate-800 bg-slate-900/30 p-4 text-center">
            <p className="text-sm text-slate-400">
              🔒 Documents chiffrés et protégés par code PIN médecin
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
