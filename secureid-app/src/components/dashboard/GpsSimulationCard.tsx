'use client';

import { motion } from 'framer-motion';
import { MapPin, Activity, Battery, Radar, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * PHASE 15 - GPS SIMULATION CARD
 *
 * Composant teaser pour la fonctionnalité GPS tracking (simulée)
 * Features:
 * - Carte style "Militaire" avec fond sombre
 * - Point pulsant pour localisation
 * - Données biométriques animées (BPM, Batterie)
 * - Overlay avec message "Bientôt disponible"
 * - CTA "Rejoindre la liste d'attente"
 */

interface GpsSimulationCardProps {
  childName?: string;
}

export function GpsSimulationCard({ childName = "Votre enfant" }: GpsSimulationCardProps) {
  const [bpm, setBpm] = useState(72);
  const [battery, setBattery] = useState(85);

  // Simuler des variations de BPM
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => {
        const variation = Math.random() * 6 - 3; // -3 à +3
        const newBpm = prev + variation;
        return Math.max(65, Math.min(85, newBpm)); // Entre 65 et 85
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simuler décharge batterie
  useEffect(() => {
    const interval = setInterval(() => {
      setBattery(prev => Math.max(0, prev - 0.1));
    }, 60000); // -0.1% par minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
      {/* Faux fond de carte abstraite */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 400 400">
          {/* Grille */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#grid)" />

          {/* Fausses routes */}
          <path d="M 50 50 Q 150 100 250 80 T 350 150" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M 100 200 L 300 250" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
          <circle cx="200" cy="150" r="60" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-brand-orange/20 p-3">
            <Radar className="h-6 w-6 text-brand-orange" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Localisation Temps Réel</h3>
            <p className="text-sm text-slate-400">{childName}</p>
          </div>
        </div>
      </div>

      {/* Zone de carte avec point pulsant */}
      <div className="relative mb-6 flex h-64 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/50">
        {/* Point pulsant (enfant) */}
        <motion.div
          className="relative"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Onde radar */}
          <motion.div
            className="absolute inset-0 -m-8 rounded-full border-2 border-brand-orange"
            animate={{
              scale: [1, 2.5],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* Point central */}
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange shadow-lg shadow-brand-orange/50">
            <MapPin className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        {/* Coordonnées factices */}
        <div className="absolute bottom-4 left-4 rounded-lg bg-slate-900/80 px-3 py-2 backdrop-blur-sm">
          <p className="font-mono text-xs text-slate-300">
            48.8566° N, 2.3522° E
          </p>
          <p className="font-mono text-xs text-slate-500">Paris, France</p>
        </div>
      </div>

      {/* Données biométriques */}
      <div className="relative mb-6 grid grid-cols-2 gap-4">
        {/* BPM (Heartbeat) */}
        <motion.div
          className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"
          animate={{
            borderColor: ['rgb(51, 65, 85)', 'rgb(249, 115, 22)', 'rgb(51, 65, 85)'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            <span className="text-sm text-slate-400">Rythme cardiaque</span>
          </div>
          <p className="text-3xl font-bold text-white">{Math.round(bpm)}</p>
          <p className="text-xs text-slate-500">BPM</p>
        </motion.div>

        {/* Batterie */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Battery className="h-5 w-5 text-green-500" />
            <span className="text-sm text-slate-400">Batterie</span>
          </div>
          <p className="text-3xl font-bold text-white">{Math.round(battery)}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-400"
              initial={{ width: '85%' }}
              animate={{ width: `${battery}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Overlay "Bientôt disponible" */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-brand-orange/30 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6 backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-orange" />
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
            Bientôt Disponible
          </span>
        </div>

        <h4 className="mb-2 text-2xl font-bold text-white">
          Tracking GPS Premium
        </h4>

        <p className="mb-6 text-slate-300">
          Suivez la position de votre enfant en temps réel, recevez des alertes de zone et consultez l&apos;historique des déplacements.
        </p>

        <button className="w-full rounded-xl bg-brand-orange px-6 py-3 font-semibold text-white transition-all hover:bg-brand-orange/90 hover:scale-105">
          Rejoindre la liste d&apos;attente
        </button>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span>✓ Géofencing</span>
          <span>✓ Historique 30j</span>
          <span>✓ Alertes SMS</span>
        </div>
      </motion.div>

      {/* Effet de lumière ambiante */}
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-brand-orange/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
    </div>
  );
}
