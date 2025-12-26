'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

/**
 * PHASE 15 - GPS SIMULATION CARD (CLEAN MAP STYLE)
 *
 * Design minimaliste Google Maps Dark Mode
 * - Carte sombre plein écran
 * - Photo enfant comme marqueur
 * - Tracé pointillé du trajet
 * - Bannière "Simulation Live" flottante
 * - CTA PRO en bas
 */

interface GpsSimulationCardProps {
  childName?: string;
  childPhotoUrl?: string;
}

export function GpsSimulationCard({
  childName = "Votre enfant",
  childPhotoUrl
}: GpsSimulationCardProps) {
  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-3xl bg-slate-950">
      {/* Fond de carte Dark Mode (style Google Maps) */}
      <div className="absolute inset-0">
        <svg className="h-full w-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          {/* Fond sombre */}
          <rect width="800" height="600" fill="#1a1d29" />

          {/* Grille subtile */}
          <defs>
            <pattern id="grid-dark" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a2d3a" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#grid-dark)" />

          {/* Fausses routes (style Google Maps) */}
          <path d="M 100 500 Q 200 450 300 400 T 500 300" stroke="#3d4050" strokeWidth="3" fill="none" opacity="0.4" />
          <path d="M 0 200 L 800 250" stroke="#3d4050" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M 600 0 Q 550 200 500 400" stroke="#3d4050" strokeWidth="2" fill="none" opacity="0.3" />

          {/* Zones (parcs, bâtiments) */}
          <circle cx="650" cy="150" r="50" fill="#2a4a2a" opacity="0.2" />
          <rect x="100" y="100" width="80" height="60" fill="#3a3a4a" opacity="0.2" />
          <circle cx="200" cy="450" r="30" fill="#2a4a2a" opacity="0.2" />
        </svg>
      </div>

      {/* Tracé du trajet (ligne pointillée) */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Ligne pointillée animée du trajet */}
        <motion.path
          d="M 100 550 Q 250 400 400 300"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeDasharray="10 5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Point de départ (Maison) */}
        <circle cx="100" cy="550" r="8" fill="#3b82f6" opacity="0.8" />
        <circle cx="100" cy="550" r="12" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
      </svg>

      {/* Bannière "Simulation Live" (flottante en haut) */}
      <motion.div
        className="absolute left-1/2 top-6 z-10 -translate-x-1/2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-black/60 px-4 py-2 backdrop-blur-md">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-sm font-medium text-white">📍 Simulation Live</span>
        </div>
      </motion.div>

      {/* Marqueur enfant (photo de profil) */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20"
        style={{ x: '-50%', y: '-50%' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
      >
        {/* Effet de pulsation radar */}
        <motion.div
          className="absolute inset-0 -m-6 rounded-full border-2 border-brand-orange"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Photo de profil avec cercle blanc */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white shadow-2xl">
          {childPhotoUrl ? (
            <Image
              src={childPhotoUrl}
              alt={childName}
              width={96}
              height={96}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-600">
              <MapPin className="h-12 w-12 text-white" />
            </div>
          )}
        </div>

        {/* Tooltip avec temps */}
        <motion.div
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="text-xs font-semibold text-slate-700">À 12 min</div>
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
        </motion.div>
      </motion.div>

      {/* Coordonnées GPS (coin bas gauche) */}
      <motion.div
        className="absolute bottom-24 left-4 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-md"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="font-mono text-xs text-slate-300">48.8566° N, 2.3522° E</p>
        <p className="font-mono text-xs text-slate-500">Paris, France</p>
      </motion.div>

      {/* CTA flottant (bas de la carte) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-30 p-6"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6 backdrop-blur-xl">
          <div className="mb-4">
            <h3 className="mb-1 text-lg font-bold text-white">Module GPS</h3>
            <p className="text-sm text-slate-400">Fonctionnalité en développement</p>
          </div>

          <button className="w-full rounded-xl bg-white px-6 py-3 font-bold text-slate-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            Être notifié du lancement
          </button>

          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span>✓ Géofencing</span>
            <span>✓ Alertes temps réel</span>
            <span>✓ Historique 30j</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
