'use client';

import { useState } from 'react';
import { GpsSimulationCard } from '@/components/dashboard/GpsSimulationCard';
import { HealthIndicators } from '@/components/dashboard/HealthIndicators';
import { MapOff, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrackingClientProps {
  childName?: string;
  childPhotoUrl?: string;
}

export function TrackingClient({ childName, childPhotoUrl }: TrackingClientProps) {
  const [gpsEnabled, setGpsEnabled] = useState(true);

  return (
    <>
      {/* Bouton Toggle GPS */}
      <div className="mb-6 flex justify-end">
        <motion.button
          onClick={() => setGpsEnabled(!gpsEnabled)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
            gpsEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {gpsEnabled ? (
            <>
              <MapPin className="h-5 w-5" />
              <span>Géolocalisation activée</span>
            </>
          ) : (
            <>
              <MapOff className="h-5 w-5" />
              <span>Géolocalisation désactivée</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Affichage conditionnel */}
      {gpsEnabled ? (
        <>
          {/* Composant GPS Simulé */}
          <GpsSimulationCard
            childName={childName}
            childPhotoUrl={childPhotoUrl}
          />

          {/* Indicateurs de santé */}
          <div className="mt-6">
            <HealthIndicators childName={childName} />
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-700 bg-slate-900 p-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
            <MapOff className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">
            Géolocalisation désactivée
          </h3>
          <p className="text-slate-400">
            La localisation en temps réel est actuellement désactivée.
            <br />
            Activez-la pour suivre la position de {childName || 'votre enfant'}.
          </p>
        </motion.div>
      )}
    </>
  );
}
