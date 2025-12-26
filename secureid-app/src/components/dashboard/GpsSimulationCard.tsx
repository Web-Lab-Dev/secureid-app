'use client';

import { motion } from 'framer-motion';
import { MapPin, Target } from 'lucide-react';
import Image from 'next/image';

/**
 * PHASE 15 - GPS SIMULATION CARD (ULTRA REALISTIC GOOGLE MAPS STYLE)
 *
 * Design 100% réaliste Google Maps Live Tracking
 * - Image satellite/dark map en fond
 * - Chemin animé avec pointillés qui avancent
 * - Pin personnalisé avec photo enfant
 * - Radar ping pour signal GPS
 * - HUD minimaliste (badge LIVE + bouton recentrer)
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
    <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
      {/* Background: Image de carte satellite/dark mode */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=1000&fit=crop"
          alt="Map background"
          fill
          className="object-cover opacity-90"
          priority
        />
        {/* Overlay sombre pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-slate-950/20" />
      </div>

      {/* SVG Layer: Chemin du trajet avec animation */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 800 500">
        <defs>
          {/* Définition du motif pointillé animé */}
          <pattern id="dashPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="transparent" />
          </pattern>
        </defs>

        {/* Chemin de Bézier (trajet) */}
        <motion.path
          d="M 100 400 Q 250 350 350 280 T 600 200"
          stroke="#3b82f6"
          strokeWidth="5"
          strokeDasharray="20 10"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -1000 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Ligne de contour plus claire pour profondeur */}
        <path
          d="M 100 400 Q 250 350 350 280 T 600 200"
          stroke="#60a5fa"
          strokeWidth="8"
          fill="none"
          opacity="0.3"
          strokeLinecap="round"
        />
      </svg>

      {/* Marker Layer: Pin avec photo enfant */}
      <motion.div
        className="absolute left-[75%] top-[40%] z-20 -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: [0, 5, -3, 8, -2, 0],
          y: [0, -4, 6, -2, 4, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1
        }}
      >
        {/* Radar Ping (Signal GPS) */}
        <motion.div
          className="absolute inset-0 -m-12 rounded-full bg-blue-500"
          animate={{
            scale: [1, 2.5],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Avatar Pin */}
        <div className="relative">
          {/* Cercle blanc avec photo */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white shadow-2xl">
            {childPhotoUrl ? (
              <Image
                src={childPhotoUrl}
                alt={childName}
                width={64}
                height={64}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Pointe du pin (triangle) */}
          <div className="absolute left-1/2 top-full -translate-x-1/2">
            <div className="h-0 w-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
          </div>
        </div>

        {/* Tooltip "À l'instant" */}
        <motion.div
          className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="rounded-lg bg-white px-3 py-2 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-slate-800">À l&apos;instant</span>
            </div>
            {/* Flèche du tooltip */}
            <div className="absolute left-1/2 top-full -translate-x-1/2">
              <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* HUD: Badge LIVE (top left) */}
      <motion.div
        className="absolute left-4 top-4 z-30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 backdrop-blur-md">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />
          <span className="text-xs font-bold uppercase tracking-wide text-white">Live</span>
        </div>
      </motion.div>

      {/* HUD: Bouton Recentrer (bottom right) */}
      <motion.button
        className="absolute bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        whileTap={{ scale: 0.95 }}
      >
        <Target className="h-5 w-5 text-blue-600" />
      </motion.button>

      {/* Info nom enfant (bottom left) - très discret */}
      <motion.div
        className="absolute bottom-4 left-4 z-30 rounded-lg bg-white/90 px-3 py-2 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-xs font-semibold text-slate-700">{childName}</p>
        <p className="font-mono text-xs text-slate-500">Position actuelle</p>
      </motion.div>
    </div>
  );
}
