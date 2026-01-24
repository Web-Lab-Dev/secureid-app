'use client';

import { motion } from 'framer-motion';
import { Shield, Navigation } from 'lucide-react';
import { formatDistance, calculateETA } from '@/lib/geo-utils';
import type { SafeZoneDocument } from '@/types/safe-zone';

interface GpsHudProps {
  distance: number;
  activeZones: SafeZoneDocument[];
}

/**
 * HUD (Heads-Up Display) pour la carte GPS
 * Affiche: badge LIVE, statut zone, distance et temps
 */
export function GpsHud({ distance, activeZones }: GpsHudProps) {
  return (
    <>
      {/* HUD: Badge LIVE (top left) */}
      <motion.div
        className="absolute left-4 top-4 z-10 flex flex-col gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Badge LIVE */}
        <div className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 backdrop-blur-md">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />
          <span className="text-xs font-bold uppercase tracking-wide text-white">Live</span>
        </div>

        {/* Badge Geofencing (Zone de Sécurité) - Multi-zones */}
        <motion.div
          className={`flex items-center gap-2 rounded-full px-3 py-2 backdrop-blur-md ${
            activeZones.length > 0
              ? 'bg-green-500/80'
              : 'bg-orange-500/80 animate-pulse'
          }`}
          animate={activeZones.length === 0 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Shield className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white">
            {activeZones.length > 0
              ? `Dans ${activeZones.length} zone${activeZones.length > 1 ? 's' : ''}`
              : 'Hors de toutes les zones'}
          </span>
        </motion.div>
      </motion.div>

      {/* Tooltip distance et temps - top right */}
      <motion.div
        className="absolute right-4 top-4 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="rounded-lg bg-white px-4 py-2 shadow-xl">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-slate-800">{formatDistance(distance)}</p>
              <p className="text-xs text-slate-600">~{calculateETA(distance)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
