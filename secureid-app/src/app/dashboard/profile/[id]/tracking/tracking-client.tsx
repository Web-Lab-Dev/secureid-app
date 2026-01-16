'use client';

import { useState } from 'react';
import { GpsSimulationCard } from '@/components/dashboard/GpsSimulationCard';
import { HealthIndicators } from '@/components/dashboard/HealthIndicators';
import { MapPinOff, MapPin, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TrackingClientProps {
  profileId: string;
  childName?: string;
  childPhotoUrl?: string;
}

export function TrackingClient({ profileId, childName, childPhotoUrl }: TrackingClientProps) {
  const [gpsEnabled, setGpsEnabled] = useState(true);

  return (
    <>
      {/* Boutons Toggle GPS + Configuration Zones */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Bouton Configuration Zones de Sécurité */}
        <Link href={`/dashboard/profile/${profileId}/safe-zones`} className="w-full sm:w-auto">
          <motion.button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-white transition-all hover:bg-blue-700"
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Configurer les Zones de Sécurité</span>
            <span className="sm:hidden">Zones de Sécurité</span>
          </motion.button>
        </Link>

        {/* Bouton Toggle GPS */}
        <motion.button
          onClick={() => setGpsEnabled(!gpsEnabled)}
          className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all ${
            gpsEnabled
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {gpsEnabled ? (
            <>
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Géolocalisation activée</span>
              <span className="sm:hidden">GPS activé</span>
            </>
          ) : (
            <>
              <MapPinOff className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Géolocalisation désactivée</span>
              <span className="sm:hidden">GPS désactivé</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Affichage conditionnel */}
      {gpsEnabled ? (
        <>
          {/* Composant GPS Simulé */}
          <GpsSimulationCard
            profileId={profileId}
            childName={childName}
            childPhotoUrl={childPhotoUrl}
            enableDemoControls={true}
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
            <MapPinOff className="h-10 w-10 text-slate-400" />
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
