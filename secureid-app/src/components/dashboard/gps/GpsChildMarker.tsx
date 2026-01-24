'use client';

import { motion } from 'framer-motion';
import { OverlayView } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import type { LatLng } from '@/lib/geo-utils';

interface GpsChildMarkerProps {
  position: LatLng;
  childName: string;
  childPhotoUrl?: string;
}

/**
 * Marqueur de l'enfant sur la carte GPS
 * Affiche la photo de l'enfant avec un effet pulse radar
 */
export function GpsChildMarker({ position, childName, childPhotoUrl }: GpsChildMarkerProps) {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div style={{ transform: 'translate(-50%, -100%)', position: 'absolute' }}>
        <div className="relative flex flex-col items-center">
          {/* Pulse radar animé */}
          <motion.div
            className="absolute left-1/2 top-8 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-blue-500"
            animate={{
              scale: [1, 2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* Photo circulaire avec bordure */}
          <div className="relative h-16 w-16 rounded-full bg-white p-1 shadow-2xl ring-4 ring-blue-500 z-10">
            {childPhotoUrl && childPhotoUrl.trim() !== '' ? (
              <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-200">
                <Image
                  src={childPhotoUrl}
                  alt={childName}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    // Masquer l'image si échec de chargement
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Pointe du pin */}
          <div className="relative -mt-1 z-10">
            <svg width="32" height="20" viewBox="0 0 32 20">
              <path d="M16 0 L0 20 L32 20 Z" fill="white" stroke="#3b82f6" strokeWidth="3"/>
            </svg>
          </div>
        </div>
      </div>
    </OverlayView>
  );
}
