'use client';

import { motion } from 'framer-motion';
import { Target, Zap, Navigation, Route, Maximize, Minimize } from 'lucide-react';

interface GpsMapControlsProps {
  showTraffic: boolean;
  showTrajectory: boolean;
  isFullscreen: boolean;
  mapType: 'roadmap' | 'satellite';
  onRecenter: () => void;
  onToggleTraffic: () => void;
  onToggleMapType: () => void;
  onToggleTrajectory: () => void;
  onToggleFullscreen: () => void;
}

/**
 * Contrôles de la carte GPS
 * Boutons: Recentrer, Trafic, Type de carte, Parcours, Plein écran
 */
export function GpsMapControls({
  showTraffic,
  showTrajectory,
  isFullscreen,
  mapType,
  onRecenter,
  onToggleTraffic,
  onToggleMapType,
  onToggleTrajectory,
  onToggleFullscreen,
}: GpsMapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
      {/* Bouton Recentrer */}
      <motion.button
        onClick={onRecenter}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        whileTap={{ scale: 0.95 }}
        title="Recentrer la carte"
      >
        <Target className="h-5 w-5 text-blue-600" />
      </motion.button>

      {/* Bouton Trafic */}
      <motion.button
        onClick={onToggleTraffic}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 hover:shadow-2xl ${
          showTraffic ? 'bg-green-500 text-white' : 'bg-white text-slate-600'
        }`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        whileTap={{ scale: 0.95 }}
        title="Afficher le trafic"
      >
        <Zap className="h-5 w-5" />
      </motion.button>

      {/* Bouton Type de carte */}
      <motion.button
        onClick={onToggleMapType}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: "spring" }}
        whileTap={{ scale: 0.95 }}
        title={mapType === 'roadmap' ? 'Vue satellite' : 'Vue carte'}
      >
        <Navigation className="h-5 w-5 text-blue-600" />
      </motion.button>

      {/* Bouton Voir Parcours (Historique) */}
      <motion.button
        onClick={onToggleTrajectory}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 hover:shadow-2xl ${
          showTrajectory ? 'bg-blue-500 text-white' : 'bg-white text-slate-600'
        }`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        whileTap={{ scale: 0.95 }}
        title={showTrajectory ? 'Masquer le parcours' : 'Voir le parcours'}
      >
        <Route className="h-5 w-5" />
      </motion.button>

      {/* Bouton Plein Écran */}
      <motion.button
        onClick={onToggleFullscreen}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 hover:shadow-2xl ${
          isFullscreen ? 'bg-purple-500 text-white' : 'bg-white text-slate-600'
        }`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: "spring" }}
        whileTap={{ scale: 0.95 }}
        title={isFullscreen ? 'Quitter le plein écran' : 'Mode plein écran'}
      >
        {isFullscreen ? (
          <Minimize className="h-5 w-5" />
        ) : (
          <Maximize className="h-5 w-5" />
        )}
      </motion.button>
    </div>
  );
}
