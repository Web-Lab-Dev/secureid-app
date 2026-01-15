'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, StopCircle, MapPin, AlertTriangle, Zap } from 'lucide-react';
import type { LatLng } from '@/lib/geo-utils';

/**
 * DEMO CONTROLS
 *
 * Contrôles pour tester le geofencing pendant les présentations
 * Permet de simuler le déplacement de l'enfant hors/dans la zone
 */

interface DemoControlsProps {
  onMoveChild: (location: LatLng) => void;
  safeZoneCenter?: LatLng;
  safeZoneRadius?: number;
  currentChildLocation: LatLng;
}

export function DemoControls({
  onMoveChild,
  safeZoneCenter,
  safeZoneRadius = 500,
  currentChildLocation,
}: DemoControlsProps) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Calculer position hors de la zone (1.5x le rayon dans direction nord-est)
  const moveOutOfZone = () => {
    if (!safeZoneCenter) return;

    // Déplacer à 1.5x le rayon pour être sûr d'être hors zone
    const offsetDegrees = (safeZoneRadius * 1.5) / 111320; // 1 degré ≈ 111.32 km

    const newLocation: LatLng = {
      lat: safeZoneCenter.lat + offsetDegrees * Math.cos(45 * Math.PI / 180),
      lng: safeZoneCenter.lng + offsetDegrees * Math.sin(45 * Math.PI / 180),
    };

    onMoveChild(newLocation);
  };

  // Replacer l'enfant au centre de la zone
  const moveIntoZone = () => {
    if (!safeZoneCenter) return;
    onMoveChild(safeZoneCenter);
  };

  // Déplacement aléatoire à 300m
  const moveRandom300m = () => {
    const angle = Math.random() * 2 * Math.PI;
    const distance = 300; // 300 mètres
    const offsetDegrees = distance / 111320;

    const newLocation: LatLng = {
      lat: currentChildLocation.lat + offsetDegrees * Math.cos(angle),
      lng: currentChildLocation.lng + offsetDegrees * Math.sin(angle),
    };

    onMoveChild(newLocation);
  };

  if (!isDemoMode) {
    return (
      <motion.button
        onClick={() => setIsDemoMode(true)}
        className="fixed bottom-6 left-6 z-20 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-purple-500/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap className="h-5 w-5" />
        Mode Démo
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-20 rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-pulse rounded-full bg-purple-500" />
          <h3 className="font-semibold text-white">Contrôles Démo</h3>
        </div>
        <button
          onClick={() => setIsDemoMode(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <StopCircle className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Bouton: Sortir de la zone */}
        <motion.button
          onClick={moveOutOfZone}
          disabled={!safeZoneCenter}
          className="flex w-full items-center gap-3 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-left text-sm font-medium text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertTriangle className="h-5 w-5" />
          <div>
            <div className="font-semibold">Sortir de la zone</div>
            <div className="text-xs text-red-300/60">Déclenche l'alerte après délai</div>
          </div>
        </motion.button>

        {/* Bouton: Rentrer dans la zone */}
        <motion.button
          onClick={moveIntoZone}
          disabled={!safeZoneCenter}
          className="flex w-full items-center gap-3 rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-3 text-left text-sm font-medium text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MapPin className="h-5 w-5" />
          <div>
            <div className="font-semibold">Rentrer dans la zone</div>
            <div className="text-xs text-green-300/60">Annule le timer d'alerte</div>
          </div>
        </motion.button>

        {/* Bouton: Déplacement aléatoire */}
        <motion.button
          onClick={moveRandom300m}
          className="flex w-full items-center gap-3 rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-3 text-left text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlayCircle className="h-5 w-5" />
          <div>
            <div className="font-semibold">Déplacement aléatoire</div>
            <div className="text-xs text-blue-300/60">Bouge de ~300m dans une direction</div>
          </div>
        </motion.button>
      </div>

      <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-400">
        <p className="font-medium text-slate-300 mb-1">💡 Scénario de test:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Cliquez "Sortir de la zone"</li>
          <li>Attendez le délai configuré (1-60 min)</li>
          <li>L'alerte visuelle + sonore se déclenche</li>
          <li>Notification push envoyée au parent</li>
          <li>Cliquez "Rentrer" pour annuler</li>
        </ol>
      </div>
    </motion.div>
  );
}
