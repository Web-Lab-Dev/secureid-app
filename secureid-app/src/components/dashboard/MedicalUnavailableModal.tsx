'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Clock } from 'lucide-react';

/**
 * MODAL INFORMATIF - CARNET DE SANTÉ INDISPONIBLE
 *
 * Affiche un message expliquant que la fonctionnalité
 * est en attente d'autorisation du Ministère de la Santé
 */

interface MedicalUnavailableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MedicalUnavailableModal({ isOpen, onClose }: MedicalUnavailableModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-orange-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20">
                  <Clock className="h-8 w-8 text-brand-orange" />
                </div>
              </div>

              {/* Title */}
              <h2 className="mb-3 text-center text-xl font-bold text-white">
                Fonctionnalité Temporairement Indisponible
              </h2>

              {/* Message */}
              <div className="mb-6 space-y-3 rounded-lg bg-slate-950/50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>
                      Le <strong className="text-white">Carnet de Santé</strong> est actuellement en attente d'autorisation du{' '}
                      <strong className="text-white">Ministère de la Santé</strong>.
                    </p>
                    <p>
                      Cette fonctionnalité sera disponible très prochainement une fois que nous aurons reçu le feu vert officiel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-gradient-to-r from-brand-orange to-orange-600 py-3 font-semibold text-white transition-transform hover:scale-105 active:scale-95"
              >
                J'ai compris
              </button>

              {/* Footer note */}
              <p className="mt-4 text-center text-xs text-slate-500">
                Merci de votre patience
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
