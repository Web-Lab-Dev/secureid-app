'use client';

import { X, GraduationCap } from 'lucide-react';
import { SchoolSection } from './SchoolSection';
import type { ProfileDocument } from '@/types/profile';
import { Button } from '@/components/ui/button';

/**
 * PHASE 9 - SCHOOL DIALOG
 *
 * Modal dialog pour gérer le portail scolaire
 * - Wraps SchoolSection component
 * - Full-screen modal avec scroll
 * - Gestion PIN école + Anges Gardiens
 */

interface SchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileDocument;
}

export function SchoolDialog({ isOpen, onClose, profile }: SchoolDialogProps) {
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
        <div className="min-h-full bg-gradient-to-b from-indigo-950 to-slate-900 px-4 py-6">
          {/* Header */}
          <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
                <GraduationCap className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Portail Scolaire 🎓
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {profile.fullName} • Gestion des sorties d'école
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

          {/* Contenu - SchoolSection */}
          <div className="mx-auto max-w-4xl">
            <SchoolSection profile={profile} />
          </div>

          {/* Footer info */}
          <div className="mx-auto mt-6 max-w-4xl rounded-lg border border-indigo-500/30 bg-indigo-950/30 p-4 text-center">
            <p className="text-sm text-indigo-300">
              🔐 Code PIN école requis pour accéder au portail de contrôle
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
