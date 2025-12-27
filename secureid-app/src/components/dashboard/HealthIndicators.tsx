'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Thermometer, Activity, Battery } from 'lucide-react';

/**
 * PHASE 15 - HEALTH INDICATORS
 *
 * Barre d'indicateurs de santé pour le tracking GPS
 * - Rythme cardiaque
 * - Température corporelle
 * - Activité (pas)
 * - Batterie du bracelet
 * - Données simulées avec variations réalistes
 */

interface HealthIndicatorsProps {
  childName?: string;
}

export function HealthIndicators({ childName = "Votre enfant" }: HealthIndicatorsProps) {
  const [heartRate, setHeartRate] = useState<number>(72);
  const [temperature, setTemperature] = useState<number>(36.8);
  const [steps, setSteps] = useState<number>(3247);
  const [battery, setBattery] = useState<number>(78);

  // Simuler variations des indicateurs de santé
  useEffect(() => {
    const interval = setInterval(() => {
      // Rythme cardiaque: 68-76 bpm (variation réaliste)
      setHeartRate(68 + Math.floor(Math.random() * 9));

      // Température: 36.6-37.0°C (variation légère)
      setTemperature(36.6 + Math.random() * 0.4);

      // Pas: augmentation progressive
      setSteps((prev) => prev + Math.floor(Math.random() * 5));

      // Batterie: diminution lente
      setBattery((prev) => Math.max(1, prev - (Math.random() < 0.1 ? 1 : 0)));
    }, 3000); // Mise à jour toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring" }}
    >
      <div className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4">
        {/* Rythme cardiaque */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
            <Heart className="h-5 w-5 text-red-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Rythme</p>
            <p className="text-lg font-bold text-white">
              {heartRate} <span className="text-xs font-normal text-slate-400">bpm</span>
            </p>
          </div>
        </div>

        {/* Température */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
            <Thermometer className="h-5 w-5 text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Température</p>
            <p className="text-lg font-bold text-white">
              {temperature.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
            </p>
          </div>
        </div>

        {/* Activité (pas) */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
            <Activity className="h-5 w-5 text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Activité</p>
            <p className="text-lg font-bold text-white">
              {steps.toLocaleString()} <span className="text-xs font-normal text-slate-400">pas</span>
            </p>
          </div>
        </div>

        {/* Batterie */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
            <Battery className="h-5 w-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Batterie</p>
            <p className="text-lg font-bold text-white">
              {battery} <span className="text-xs font-normal text-slate-400">%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Nom enfant intégré dans la barre */}
      <div className="border-t border-slate-700/30 bg-slate-900/50 px-6 py-2">
        <p className="text-xs font-semibold text-slate-300">{childName}</p>
        <p className="font-mono text-xs text-slate-500">Indicateurs en temps réel</p>
      </div>
    </motion.div>
  );
}
