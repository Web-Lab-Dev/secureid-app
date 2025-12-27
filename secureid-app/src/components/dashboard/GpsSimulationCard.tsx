'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, TrafficLayer } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, Target, Navigation, Zap } from 'lucide-react';
import Image from 'next/image';
import { generateRandomLocation, calculateDistance, calculateETA, formatDistance, type LatLng } from '@/lib/geo-utils';
import { darkModeMapStyles } from '@/lib/map-styles';
import { logger } from '@/lib/logger';

/**
 * PHASE 15 - GPS SIMULATION CARD (GOOGLE MAPS INTEGRATION)
 *
 * Carte GPS interactive avec vraie Google Maps
 * - Géolocalisation position parent (dashboard)
 * - Position enfant simulée à ~5km
 * - Polyline animée bleue avec pointillés ondulants
 * - Marqueurs personnalisés
 * - Calcul distance et temps réel
 */

interface GpsSimulationCardProps {
  childName?: string;
  childPhotoUrl?: string;
}

// Position par défaut (Paris) si géolocalisation refusée
const DEFAULT_LOCATION: LatLng = { lat: 48.8566, lng: 2.3522 };

export function GpsSimulationCard({
  childName = "Votre enfant",
  childPhotoUrl
}: GpsSimulationCardProps) {
  const [parentLocation, setParentLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [childLocation, setChildLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [distance, setDistance] = useState<number>(0);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [dashOffset, setDashOffset] = useState<number>(0);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [childMarkerPosition, setChildMarkerPosition] = useState<{ x: number; y: number } | null>(null);

  // Charger Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Afficher erreur si échec de chargement
  if (loadError) {
    return (
      <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl">
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <MapPin className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Erreur Google Maps</h3>
            <p className="mt-2 text-sm text-slate-400">
              {loadError.message?.includes('ApiTargetBlockedMapError')
                ? "Votre clé API Google Maps a des restrictions qui bloquent cette application."
                : "Impossible de charger Google Maps."}
            </p>
            <div className="mt-4 rounded-lg bg-slate-800 p-4 text-left">
              <p className="text-xs font-semibold text-white mb-2">Solution :</p>
              <ol className="space-y-1 text-xs text-slate-400">
                <li>1. Allez sur Google Cloud Console</li>
                <li>2. Credentials → Votre API Key</li>
                <li>3. Application Restrictions → None (ou ajoutez votre domaine)</li>
                <li>4. API Restrictions → Maps JavaScript API activée</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Géolocalisation au chargement
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newParentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setParentLocation(newParentLocation);

          // Générer position enfant à ~500-1000m
          const newChildLocation = generateRandomLocation(newParentLocation, 500, 1000);
          setChildLocation(newChildLocation);

          // Calculer distance
          const dist = calculateDistance(newParentLocation, newChildLocation);
          setDistance(dist);
        },
        (error) => {
          logger.info('Geolocation denied, using default location', { error: error.message });
          // Générer position enfant depuis position par défaut à ~500-1000m
          const newChildLocation = generateRandomLocation(DEFAULT_LOCATION, 500, 1000);
          setChildLocation(newChildLocation);
          setDistance(calculateDistance(DEFAULT_LOCATION, newChildLocation));
        }
      );
    } else {
      // Générer position enfant depuis position par défaut à ~500-1000m
      const newChildLocation = generateRandomLocation(DEFAULT_LOCATION, 500, 1000);
      setChildLocation(newChildLocation);
      setDistance(calculateDistance(DEFAULT_LOCATION, newChildLocation));
    }
  }, []);

  // Fonction pour mettre à jour la position du marqueur enfant
  const updateChildMarkerPosition = useCallback((map: google.maps.Map, location: LatLng) => {
    const projection = map.getProjection();
    const zoom = map.getZoom();
    if (projection && zoom !== undefined) {
      const point = projection.fromLatLngToPoint(new google.maps.LatLng(location.lat, location.lng));
      const bounds = map.getBounds();
      const ne = bounds?.getNorthEast();
      const sw = bounds?.getSouthWest();

      if (point && ne && sw) {
        const nePoint = projection.fromLatLngToPoint(ne);
        const swPoint = projection.fromLatLngToPoint(sw);

        if (nePoint && swPoint) {
          const scale = Math.pow(2, zoom);
          const worldPoint = new google.maps.Point(
            point.x * scale,
            point.y * scale
          );
          const worldNe = new google.maps.Point(
            nePoint.x * scale,
            nePoint.y * scale
          );
          const worldSw = new google.maps.Point(
            swPoint.x * scale,
            swPoint.y * scale
          );

          const mapSize = map.getDiv().getBoundingClientRect();
          const x = ((worldPoint.x - worldSw.x) / (worldNe.x - worldSw.x)) * mapSize.width;
          const y = ((worldPoint.y - worldNe.y) / (worldSw.y - worldNe.y)) * mapSize.height;

          setChildMarkerPosition({ x, y });
        }
      }
    }
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);

    // Calculer le point central entre parent et enfant
    const centerLat = (parentLocation.lat + childLocation.lat) / 2;
    const centerLng = (parentLocation.lng + childLocation.lng) / 2;

    // Centrer sur le point milieu avec zoom fixe optimal
    map.setCenter({ lat: centerLat, lng: centerLng });
    map.setZoom(13); // Zoom fixe qui affiche bien les rues et l'environnement

    // Écouter les changements de vue (pan/zoom) pour repositionner le marqueur
    map.addListener('idle', () => {
      updateChildMarkerPosition(map, childLocation);
    });
  }, [childLocation, parentLocation, updateChildMarkerPosition]);

  // Simuler mouvement léger de l'enfant
  useEffect(() => {
    const interval = setInterval(() => {
      setChildLocation((prev) => {
        // Petit mouvement aléatoire (±5m)
        const newLocation = generateRandomLocation(prev, 0, 10);
        setDistance(calculateDistance(parentLocation, newLocation));
        return newLocation;
      });
    }, 5000); // Toutes les 5 secondes

    return () => clearInterval(interval);
  }, [parentLocation]);

  // Mettre à jour la position du marqueur quand la carte est prête
  useEffect(() => {
    if (!mapRef) return;

    // Attendre que la carte soit complètement chargée
    const timer = setTimeout(() => {
      updateChildMarkerPosition(mapRef, childLocation);
    }, 100);

    return () => clearTimeout(timer);
  }, [childLocation, mapRef, updateChildMarkerPosition]);

  // Animation ondulation des pointillés (0-100%)
  useEffect(() => {
    const interval = setInterval(() => {
      setDashOffset((prev) => (prev + 1) % 100);
    }, 50); // Animation fluide toutes les 50ms

    return () => clearInterval(interval);
  }, []);

  const handleRecenter = () => {
    if (mapRef) {
      mapRef.panTo(parentLocation);
      mapRef.setZoom(14);
    }
  };

  const toggleMapType = () => {
    if (mapRef) {
      const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
      setMapType(newType);
      mapRef.setMapTypeId(newType);
    }
  };

  if (!isLoaded) {
    return (
      <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-400">Chargement de la carte...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={parentLocation}
        zoom={13}
        onLoad={onLoad}
        options={{
          styles: darkModeMapStyles,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Polyline (trajet avec pointillés ondulants) - Seulement si positions valides */}
        {parentLocation.lat !== DEFAULT_LOCATION.lat && childLocation.lat !== DEFAULT_LOCATION.lat && (
          <Polyline
            path={[parentLocation, childLocation]}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0, // Ligne invisible, on utilise seulement les icônes
              strokeWeight: 4,
              icons: [
                {
                  icon: {
                    path: 'M 0,-1 0,1', // Petit trait vertical
                    strokeOpacity: 1,
                    strokeColor: '#3b82f6',
                    strokeWeight: 4,
                    scale: 4,
                  },
                  offset: `${dashOffset}%`,
                  repeat: '20px', // Espacement entre les points
                },
              ],
            }}
          />
        )}

        {/* Traffic Layer pour plus de réalisme */}
        {showTraffic && <TrafficLayer />}

        {/* Marqueur parent (dashboard) */}
        <Marker
          position={parentLocation}
          icon={{
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="3"/>
                <path d="M20 12 L20 20 L26 26 M14 18 L20 18 L20 14" stroke="white" stroke-width="2" fill="none"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          }}
        />

        {/* Marqueur enfant - Ne pas utiliser la photo directement, on va créer un overlay personnalisé */}
        <Marker
          position={childLocation}
          icon={{
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="1" height="1" xmlns="http://www.w3.org/2000/svg">
                <circle cx="0.5" cy="0.5" r="0.5" fill="transparent"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(1, 1),
            anchor: new google.maps.Point(0, 0),
          }}
        />
      </GoogleMap>

      {/* HUD: Badge LIVE (top left) */}
      <motion.div
        className="absolute left-4 top-4 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 backdrop-blur-md">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />
          <span className="text-xs font-bold uppercase tracking-wide text-white">Live</span>
        </div>
      </motion.div>

      {/* Marqueur enfant personnalisé avec photo (overlay DOM) */}
      {childMarkerPosition && (
        <div
          className="absolute z-20 pointer-events-none transition-all duration-300"
          style={{
            left: `${childMarkerPosition.x}px`,
            top: `${childMarkerPosition.y}px`,
            transform: `translate(-50%, -100%)`,
          }}
        >
        <motion.div
          className="relative"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Pin avec photo */}
          <div className="relative flex flex-col items-center">
            {/* Photo circulaire avec ombre */}
            <div className="relative h-16 w-16 rounded-full bg-white p-1 shadow-2xl ring-4 ring-blue-500">
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

              {/* Pulse radar autour de la photo */}
              <motion.div
                className="absolute inset-0 -m-2 rounded-full bg-blue-500"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </div>

            {/* Pointe du pin (triangle) */}
            <div className="relative -mt-1">
              <div className="h-0 w-0 border-l-12 border-r-12 border-t-16 border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
            </div>
          </div>
        </motion.div>
        </div>
      )}

      {/* Tooltip distance et temps - déplacé en haut à droite */}
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

      {/* Contrôles carte (bottom right) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        {/* Bouton Recentrer */}
        <motion.button
          onClick={handleRecenter}
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
          onClick={() => setShowTraffic(!showTraffic)}
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
          onClick={toggleMapType}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          whileTap={{ scale: 0.95 }}
          title={mapType === 'roadmap' ? 'Vue satellite' : 'Vue carte'}
        >
          <Navigation className="h-5 w-5 text-blue-600" />
        </motion.button>
      </div>

    </div>
  );
}
