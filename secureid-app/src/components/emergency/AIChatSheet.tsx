'use client';

import { Bot, X, Pill, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PHASE 6C - AI CHAT BOTTOM SHEET (Mockup UI)
 *
 * Bottom sheet avec interface chat IA (non fonctionnel)
 * - Slide up animation
 * - Message d'accueil
 * - Chips de suggestions
 * - Design glassmorphism
 */

interface AIChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatSheet({ isOpen, onClose }: AIChatSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-slate-900/95 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Assistant IA</h2>
                  <p className="text-xs text-slate-400">Prêt à vous aider</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Message d'accueil */}
              <div className="mb-6 flex gap-3">
                <div className="shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 rounded-2xl rounded-tl-sm bg-slate-800/60 p-4 backdrop-blur-sm">
                  <p className="text-sm text-slate-200">
                    Bonjour. Je détecte que vous êtes en situation d'urgence. Je peux vous aider à
                    trouver rapidement :
                  </p>
                </div>
              </div>

              {/* Chips de suggestions */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Suggestions rapides
                </p>
                <div className="flex flex-col gap-2">
                  <button className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/40 p-4 text-left transition-all hover:border-blue-500/50 hover:bg-slate-800/60 active:scale-98">
                    <div className="rounded-lg bg-blue-500/20 p-2">
                      <Pill className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Pharmacie la plus proche</p>
                      <p className="text-xs text-slate-400">Ouverte 24h/24</p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/40 p-4 text-left transition-all hover:border-green-500/50 hover:bg-slate-800/60 active:scale-98">
                    <div className="rounded-lg bg-green-500/20 p-2">
                      <MapPin className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Hôpital le plus proche</p>
                      <p className="text-xs text-slate-400">Services d'urgence</p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/40 p-4 text-left transition-all hover:border-red-500/50 hover:bg-slate-800/60 active:scale-98">
                    <div className="rounded-lg bg-red-500/20 p-2">
                      <Phone className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Premiers secours</p>
                      <p className="text-xs text-slate-400">Instructions immédiates</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
