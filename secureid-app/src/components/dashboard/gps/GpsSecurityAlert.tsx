'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface GpsSecurityAlertProps {
  show: boolean;
  childName: string;
  onDismiss: () => void;
}

/**
 * Alerte de sécurité GPS
 * Affichée quand l'enfant est hors de la zone de sécurité
 */
export function GpsSecurityAlert({ show, childName, onDismiss }: GpsSecurityAlertProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute left-1/2 top-4 z-30 -translate-x-1/2"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring" }}
        >
          <div className="rounded-xl bg-red-600 px-6 py-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
              <div>
                <p className="font-bold text-white">ALERTE SECURITE</p>
                <p className="text-sm text-white/90">
                  {childName || 'Votre enfant'} est hors de la zone securisee depuis plus de 1 minute
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="ml-2 rounded-full p-1 hover:bg-red-700 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
