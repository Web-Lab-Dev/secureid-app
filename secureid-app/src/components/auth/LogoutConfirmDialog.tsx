'use client';

import { X, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PHASE 9 - LOGOUT CONFIRM DIALOG
 *
 * Dialog de confirmation avant déconnexion
 * Évite les "miss-clicks" qui déconnectent l'utilisateur par erreur
 */

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function LogoutConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: LogoutConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-9999 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/20 p-3">
                <Shield className="h-6 w-6 text-brand-orange" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Verrouiller la session ?</h2>
                <p className="text-sm text-slate-400">Confirmation requise</p>
              </div>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Message */}
          <div className="mb-6 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
            <p className="text-center text-slate-300">
              Vous devrez entrer votre mot de passe pour revenir.
            </p>
            <p className="mt-2 text-center text-sm text-slate-400">
              Assurez-vous d'avoir sauvegardé vos modifications.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              disabled={loading}
              variant="outline"
              size="md"
              className="flex-1 border-slate-700 text-slate-300"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              variant="danger"
              size="md"
              className="flex-1"
            >
              <LogOut className="h-4 w-4" />
              {loading ? 'Déconnexion...' : 'Se déconnecter'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
