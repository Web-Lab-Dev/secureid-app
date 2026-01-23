'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * PHASE 15 - BANNER DISCLAIMER GPS
 *
 * Avertissement professionnel pour la fonctionnalité GPS
 * - S'affiche en haut de la page comme un banner
 * - Disparaît automatiquement après 30s
 * - Message professionnel indiquant que seul le GPS est en développement
 */

export function GpsDisclaimerModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher le banner après un court délai
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    // Auto-fermer après 30 secondes
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 30800); // 800ms + 30s

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -200, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed left-0 right-0 top-0 z-50 px-4 pt-4"
        >
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-xl border border-brand-orange/20 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 shadow-2xl backdrop-blur-lg">
              {/* Animated gradient background */}
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-orange/5 to-transparent"
              />

              <div className="relative p-4">
                {/* Close button */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3 pr-8">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-600">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 -m-1 rounded-full bg-brand-orange"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">Fonctionnalité en Développement</h4>
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
                        Bêta
                      </span>
                    </div>
                    <p className="text-sm leading-snug text-slate-300">
                      La <span className="font-medium text-orange-400">position de l'enfant en temps réel</span> est actuellement en cours de finalisation.
                      <span className="text-slate-400"> Toutes les autres fonctionnalités sont pleinement opérationnelles.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar for auto-close */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 30, ease: "linear" }}
                className="h-0.5 origin-left bg-gradient-to-r from-brand-orange via-orange-500 to-brand-orange"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
