'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, TrafficLayer, Circle } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { GpsHud, GpsMapControls, GpsSecurityAlert, GpsChildMarker } from './gps';
import { generateRandomLocation, calculateDistance, calculateETA, formatDistance, type LatLng } from '@/lib/geo-utils';
import { darkModeMapStyles } from '@/lib/map-styles';
import { logger } from '@/lib/logger';
import type { PointOfInterest, TrajectoryPoint } from '@/lib/types/gps';
import type { SafeZoneDocument } from '@/types/safe-zone';
import { DEFAULT_SAFE_ZONE, DEFAULT_TRAJECTORY, POI_COLORS, POI_ICONS, generatePoiSvg, encodeSvgToDataUrl } from '@/lib/constants/gps';
import { sendGeofenceExitNotification } from '@/actions/notification-actions';
import { getSafeZones } from '@/actions/safe-zone-actions';
import { useAuthContext } from '@/contexts/AuthContext';
import { OUAGADOUGOU_LOCATIONS, DEFAULT_PARENT_LOCATION } from '@/lib/mock-locations';
import { DemoControls } from './DemoControls';

/**
 * PHASE 15 - GPS SIMULATION CARD (GOOGLE MAPS INTEGRATION)
 *
 * Carte GPS interactive avec vraie Google Maps
 * - Géolocalisation position parent (dashboard)
 * - Position enfant simulée à 800-1000m du parent
 * - Déplacement enfant: 100-200m toutes les 5 secondes
 * - Polyline animée bleue avec pointillés ondulants
 * - Marqueurs personnalisés
 * - Calcul distance et temps réel
 */

interface GpsSimulationCardProps {
  childName?: string;
  childPhotoUrl?: string;
  profileId?: string; // Pour charger les zones de sécurité
  enableDemoControls?: boolean; // Activer les contrôles de démo pour tests
}

// Position par défaut (Ouagadougou) si géolocalisation refusée
const DEFAULT_LOCATION: LatLng = DEFAULT_PARENT_LOCATION;

export function GpsSimulationCard({
  childName = "Votre enfant",
  childPhotoUrl,
  profileId,
  enableDemoControls = false
}: GpsSimulationCardProps) {
  const { user } = useAuthContext();
  const [parentLocation, setParentLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [childLocation, setChildLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [distance, setDistance] = useState<number>(0);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [dashOffset, setDashOffset] = useState<number>(0);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // NOUVELLES FEATURES - Geofencing Multi-Zones, POI, Trajectory
  const [safeZones, setSafeZones] = useState<SafeZoneDocument[]>([]);
  const [activeZones, setActiveZones] = useState<SafeZoneDocument[]>([]); // Zones où enfant est présent
  const [trajectoryHistory, setTrajectoryHistory] = useState<TrajectoryPoint[]>([]);
  const [trajectoryPolyline, setTrajectoryPolyline] = useState<google.maps.Polyline | null>(null);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(false);
  const [poiMarkers, setPoiMarkers] = useState<Map<string, google.maps.Marker>>(new Map());
  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([]);

  // Alerte zone de sécurité
  const [showSecurityAlert, setShowSecurityAlert] = useState<boolean>(false);
  const [alertedZone, setAlertedZone] = useState<SafeZoneDocument | null>(null);

  // Refs pour éviter les notifications multiples et race conditions
  // IMPORTANT: Utiliser des refs et non des states pour synchronicité
  const outOfZoneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationSentRef = useRef<boolean>(false);
  const previousActiveZonesRef = useRef<number>(0);

  // Son d'alerte - lazy-loaded pour réduire bundle initial
  // NOTE: Fichier audio OGG (format compatible tous navigateurs)
  const playAlertRef = useRef<(() => void) | null>(null);

  // Fonction pour jouer le son d'alerte (charge use-sound à la demande)
  const playAlert = useCallback(async () => {
    // Lazy-load use-sound seulement quand nécessaire
    if (!playAlertRef.current) {
      try {
        const useSound = (await import('use-sound')).default;
        // Note: useSound est un hook, mais on l'utilise ici de manière sûre
        // car on ne change pas l'ordre des hooks (c'est dans un callback)
        const audio = new Audio('/sounds/alert.ogg');
        audio.volume = 0.7;
        playAlertRef.current = () => {
          audio.currentTime = 0; // Permet de rejouer immédiatement
          audio.play().catch(() => {
            // Ignorer les erreurs de lecture (ex: politique autoplay)
          });
        };
      } catch {
        // Fallback silencieux si use-sound ne charge pas
        playAlertRef.current = () => {};
      }
    }
    playAlertRef.current();
  }, []);

  // Charger Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Afficher erreur si échec de chargement
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

          // Générer position enfant à 800-1000m du parent (pour démo)
          const newChildLocation = generateRandomLocation(newParentLocation, 800, 1000);
          setChildLocation(newChildLocation);

          // Calculer distance
          const dist = calculateDistance(newParentLocation, newChildLocation);
          setDistance(dist);
        },
        (error) => {
          logger.info('Geolocation denied, using default location', { error: error.message });
          // Générer position enfant depuis position par défaut à 800-1000m (pour démo)
          const newChildLocation = generateRandomLocation(DEFAULT_LOCATION, 800, 1000);
          setChildLocation(newChildLocation);
          setDistance(calculateDistance(DEFAULT_LOCATION, newChildLocation));
        }
      );
    } else {
      // Générer position enfant depuis position par défaut à 800-1000m (pour démo)
      const newChildLocation = generateRandomLocation(DEFAULT_LOCATION, 800, 1000);
      setChildLocation(newChildLocation);
      setDistance(calculateDistance(DEFAULT_LOCATION, newChildLocation));
    }
  }, []);

  // Charger les zones via Server Action (Admin SDK)
  useEffect(() => {
    if (!profileId || !user) return;

    getSafeZones(profileId, user.uid)
      .then((zones) => {
        setSafeZones(zones);
        logger.info('Safe zones loaded', { count: zones.length, profileId });
      })
      .catch((error) => {
        logger.error('Error loading safe zones', { error, profileId });
      });
  }, [profileId, user]);


  const onLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);

    // Calculer le point central entre parent et enfant
    const centerLat = (parentLocation.lat + childLocation.lat) / 2;
    const centerLng = (parentLocation.lng + childLocation.lng) / 2;

    // Centrer sur le point milieu avec zoom fixe optimal
    map.setCenter({ lat: centerLat, lng: centerLng });
    map.setZoom(13); // Zoom fixe qui affiche bien les rues et l'environnement
  }, [childLocation, parentLocation]);

  // Simuler mouvement de l'enfant (visible sur carte)
  useEffect(() => {
    const interval = setInterval(() => {
      setChildLocation((prev) => {
        // Mouvement aléatoire visible (100-200m) - simule déplacement enfant
        const newLocation = generateRandomLocation(prev, 100, 200);
        setDistance(calculateDistance(parentLocation, newLocation));

        // Ajouter à l'historique de trajet
        setTrajectoryHistory((history) => {
          const newHistory: TrajectoryPoint[] = [
            ...history,
            { ...newLocation, timestamp: Date.now() }
          ];
          // Garder uniquement les 50 derniers points (~4 minutes)
          return newHistory.slice(-DEFAULT_TRAJECTORY.maxPoints);
        });

        return newLocation;
      });
    }, 5000); // Toutes les 5 secondes

    return () => clearInterval(interval);
  }, [parentLocation]);

  // Animation ondulation des pointillés (0-100%)
  useEffect(() => {
    const interval = setInterval(() => {
      setDashOffset((prev) => (prev + 1) % 100);
    }, 50); // Animation fluide toutes les 50ms

    return () => clearInterval(interval);
  }, []);

  // ========== NOUVELLES FEATURES GPS ==========

  // 1️⃣ VÉRIFIER ZONES ACTIVES (Multi-zones geofencing)
  useEffect(() => {
    // Vérifier dans quelles zones l'enfant se trouve
    const zonesWhereChildIs = safeZones.filter((zone) => {
      if (!zone.enabled) return false;
      const dist = calculateDistance(childLocation, zone.center);
      return dist <= zone.radius;
    });

    const currentZoneCount = zonesWhereChildIs.length;
    const previousZoneCount = previousActiveZonesRef.current;

    // Mettre à jour l'état des zones actives
    setActiveZones(zonesWhereChildIs);
    previousActiveZonesRef.current = currentZoneCount;

    // Si enfant hors de TOUTES les zones
    const isOutOfAllZones = safeZones.length > 0 && currentZoneCount === 0;
    const wasInAtLeastOneZone = previousZoneCount > 0;

    // Traçage geofencing pour diagnostic
    logger.debug('Geofence check', {
      currentZoneCount,
      previousZoneCount,
      isOutOfAllZones,
      wasInAtLeastOneZone,
      notificationSent: notificationSentRef.current,
      timerExists: !!outOfZoneTimerRef.current,
      safeZonesCount: safeZones.length,
    });

    // Si l'enfant SORT de toutes les zones (transition sûre → hors zone)
    // Vérifications SYNCHRONES avec refs pour éviter race conditions:
    // 1. Était dans au moins une zone
    // 2. Maintenant hors de toutes les zones
    // 3. Notification pas encore envoyée (ref)
    // 4. Pas de timer déjà en cours (ref)
    if (wasInAtLeastOneZone && isOutOfAllZones && !notificationSentRef.current && !outOfZoneTimerRef.current) {
      // Utiliser le délai de la première zone (ou minimum des délais)
      const minDelay = Math.min(...safeZones.map(z => z.alertDelay));
      const delayMs = minDelay * 60 * 1000; // Minutes → millisecondes

      // Démarrage du timer d'alerte geofence
      logger.info('Geofence: démarrage timer alerte', {
        delayMinutes: minDelay,
        delayMs,
      });

      // Marquer IMMÉDIATEMENT qu'un timer est en cours (synchrone)
      const timer = setTimeout(async () => {
        // Double vérification avant d'envoyer
        if (notificationSentRef.current) {
          logger.info('Notification already sent, skipping duplicate');
          return;
        }

        // Marquer comme envoyé AVANT toute action async
        notificationSentRef.current = true;

        const firstZone = safeZones[0];
        setShowSecurityAlert(true);
        setAlertedZone(firstZone);

        // 🔊 Jouer le son d'alerte
        try {
          await playAlert();
        } catch (error) {
          logger.warn('Failed to play alert sound', { error });
        }

        // Envoyer UNE SEULE notification push
        if (user?.uid) {
          try {
            logger.info('Geofence: envoi notification', { parentId: user.uid, childName });
            await sendGeofenceExitNotification(user.uid, childName, minDelay);
            logger.info('Geofence: notification envoyée avec succès');
          } catch (error) {
            logger.error('Geofence: erreur envoi notification', { error });
          }
        }
      }, delayMs);

      // Stocker dans ref (synchrone, pas de race condition)
      outOfZoneTimerRef.current = timer;
    }

    // Si l'enfant RENTRE dans au moins une zone
    if (currentZoneCount > 0 && outOfZoneTimerRef.current) {
      logger.info('Geofence: enfant de retour en zone, annulation timer', { currentZoneCount });
      clearTimeout(outOfZoneTimerRef.current);
      outOfZoneTimerRef.current = null;
      setShowSecurityAlert(false);
      setAlertedZone(null);
      notificationSentRef.current = false;
    }
  }, [childLocation, safeZones, user?.uid, childName, playAlert]);

  // Cleanup du timer au démontage
  useEffect(() => {
    return () => {
      if (outOfZoneTimerRef.current) {
        clearTimeout(outOfZoneTimerRef.current);
        outOfZoneTimerRef.current = null;
      }
    };
  }, []);

  // 3️⃣ CRÉER POI (Points d'Intérêt) - Maison, École, Hôpital (Ouagadougou)
  useEffect(() => {
    if (!mapRef || pointsOfInterest.length > 0) return; // Ne générer que si vide

    // Utiliser les coordonnées réelles de Ouagadougou formant un triangle d'environ 1km
    const pois: PointOfInterest[] = [
      {
        id: 'home',
        name: 'Maison',
        position: OUAGADOUGOU_LOCATIONS.HOME,
        type: 'HOME',
        icon: '🏠'
      },
      {
        id: 'school',
        name: 'École Primaire',
        position: OUAGADOUGOU_LOCATIONS.SCHOOL,
        type: 'SCHOOL',
        icon: '🏫'
      },
      {
        id: 'doctor',
        name: 'Hôpital CHU Yalgado',
        position: OUAGADOUGOU_LOCATIONS.HOSPITAL,
        type: 'DOCTOR',
        icon: '🏥'
      }
    ];

    setPointsOfInterest(pois);
  }, [mapRef]); // Générer uniquement au chargement (pas de dépendance à parentLocation)

  // 4️⃣ AFFICHER MARKERS POI SUR LA CARTE
  useEffect(() => {
    if (!mapRef || pointsOfInterest.length === 0) return;

    // Nettoyer les anciens markers
    poiMarkers.forEach((marker) => marker.setMap(null));
    const newMarkers = new Map<string, google.maps.Marker>();

    pointsOfInterest.forEach((poi) => {
      // Créer le SVG icon (sans emoji pour éviter erreur btoa)
      const svgIcon = generatePoiSvg(poi.type);
      const svgUrl = encodeSvgToDataUrl(svgIcon);

      // Créer le marker
      const marker = new google.maps.Marker({
        map: mapRef,
        position: poi.position,
        title: poi.name,
        icon: {
          url: svgUrl,
          scaledSize: new google.maps.Size(40, 52),
          anchor: new google.maps.Point(20, 52),
        },
        zIndex: 1000, // Forcer au-dessus des autres éléments
      });

      // Ajouter InfoWindow au click
      const dist = calculateDistance(childLocation, poi.position);
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; color: #1f2937; font-family: sans-serif;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${poi.icon || ''} ${poi.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">Distance: ${formatDistance(dist)}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapRef, marker);
      });

      newMarkers.set(poi.id, marker);
    });

    setPoiMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [mapRef, pointsOfInterest, childLocation]);

  // 5️⃣ AFFICHER HISTORIQUE DE TRAJET (Polyline pointillée)
  useEffect(() => {
    if (!mapRef || !showTrajectory || trajectoryHistory.length < 2) {
      // Masquer la polyline si désactivée
      if (trajectoryPolyline) {
        trajectoryPolyline.setMap(null);
        setTrajectoryPolyline(null);
      }
      return;
    }

    // Supprimer l'ancienne polyline
    if (trajectoryPolyline) {
      trajectoryPolyline.setMap(null);
    }

    // Créer nouvelle polyline depuis l'historique
    const newPolyline = new google.maps.Polyline({
      map: mapRef,
      path: trajectoryHistory,
      strokeColor: DEFAULT_TRAJECTORY.color,
      strokeOpacity: DEFAULT_TRAJECTORY.opacity,
      strokeWeight: 2,
      geodesic: true,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 2,
          fillColor: DEFAULT_TRAJECTORY.color,
          fillOpacity: 1,
          strokeWeight: 0,
        },
        offset: '0',
        repeat: '15px',
      }],
    });

    setTrajectoryPolyline(newPolyline);

    return () => {
      newPolyline.setMap(null);
    };
  }, [mapRef, showTrajectory, trajectoryHistory]);

  // ========== FIN NOUVELLES FEATURES ==========

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

  // Fonction pour déplacer manuellement l'enfant (Mode Démo)
  const handleMoveChild = (newLocation: LatLng) => {
    setChildLocation(newLocation);
    setDistance(calculateDistance(parentLocation, newLocation));
    logger.info('Demo: Child moved manually', { newLocation });
  };

  // Gestion du mode plein écran
  const toggleFullscreen = useCallback(() => {
    const mapContainer = document.getElementById('gps-map-container');
    if (!mapContainer) return;

    if (!document.fullscreenElement) {
      // Entrer en plein écran
      mapContainer.requestFullscreen().then(() => {
        setIsFullscreen(true);
        logger.info('Entered fullscreen mode');
      }).catch((err) => {
        logger.error('Error entering fullscreen', { error: err });
      });
    } else {
      // Quitter le plein écran
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        logger.info('Exited fullscreen mode');
      }).catch((err) => {
        logger.error('Error exiting fullscreen', { error: err });
      });
    }
  }, []);

  // Détecter les changements de fullscreen (ESC, F11, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
                <li>2. Credentials vers Votre API Key</li>
                <li>3. Application Restrictions vers None (ou ajoutez votre domaine)</li>
                <li>4. API Restrictions vers Maps JavaScript API activée</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="space-y-4">
      <div
        id="gps-map-container"
        className={`relative w-full overflow-hidden rounded-3xl border border-slate-200 shadow-2xl transition-all ${
          isFullscreen ? 'h-screen' : 'h-[500px] sm:h-[560px]'
        }`}
      >
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
        {/* Polyline (trajet avec pointillés ondulants) - Toujours affichée */}
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

        {/* Traffic Layer pour plus de réalisme */}
        {showTraffic && <TrafficLayer />}

        {/* Zones de Sécurité - Affichage multi-zones */}
        {safeZones.filter(zone => zone.enabled).map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            options={{
              fillColor: zone.color,
              fillOpacity: 0.15,
              strokeColor: zone.color,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              clickable: false,
            }}
          />
        ))}

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

        {/* Marqueur enfant avec photo */}
        <GpsChildMarker
          position={childLocation}
          childName={childName}
          childPhotoUrl={childPhotoUrl}
        />
      </GoogleMap>

      {/* HUD: Badge LIVE, Zone Status, Distance */}
      <GpsHud distance={distance} activeZones={activeZones} />

      {/* Contrôles carte (bottom right) */}
      <GpsMapControls
        showTraffic={showTraffic}
        showTrajectory={showTrajectory}
        isFullscreen={isFullscreen}
        mapType={mapType}
        onRecenter={handleRecenter}
        onToggleTraffic={() => setShowTraffic(!showTraffic)}
        onToggleMapType={toggleMapType}
        onToggleTrajectory={() => setShowTrajectory(!showTrajectory)}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Alerte Zone de Sécurité */}
      <GpsSecurityAlert
        show={showSecurityAlert}
        childName={childName}
        onDismiss={() => setShowSecurityAlert(false)}
      />

      </div>

      {/* Contrôles de démo pour tests présentation */}
      {enableDemoControls && !isFullscreen && (
        <DemoControls
          onMoveChild={handleMoveChild}
          safeZoneCenter={safeZones.length > 0 ? safeZones[0].center : undefined}
          safeZoneRadius={safeZones.length > 0 ? safeZones[0].radius : 500}
          currentChildLocation={childLocation}
        />
      )}
    </div>
  );
}
