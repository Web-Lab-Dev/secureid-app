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

      {/* Modal - Design Apaisant Menthe */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-50 overflow-y-auto">
        <div className="min-h-full bg-gradient-to-b from-health-bg to-slate-900 px-4 py-6">
          {/* Header */}
          <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-health-mint/20 animate-soft-bounce">
                <FileHeart className="h-7 w-7 text-health-mint" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Carnet de Santé 🩺
                </h1>
                <p className="mt-1 text-sm text-health-teal">
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
            <div className="rounded-2xl border-2 border-health-teal/20 bg-slate-900/50 p-6 sm:p-8">
              <ConfidentialZone profile={profile} />
            </div>
          </div>

          {/* Footer info */}
          <div className="mx-auto mt-6 max-w-4xl rounded-2xl border-2 border-health-mint/30 bg-health-bg/30 p-4 text-center">
            <p className="text-sm text-health-mint">
              🔒 Documents chiffrés et protégés par code PIN médecin
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
