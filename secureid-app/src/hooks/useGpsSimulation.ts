/**
 * Hook pour la simulation GPS
 * Gère les positions parent/enfant et les mouvements
 */

import { useState, useEffect, useCallback } from 'react';
import { generateRandomLocation, calculateDistance, type LatLng } from '@/lib/geo-utils';
import { logger } from '@/lib/logger';

// Position par défaut (Paris) si géolocalisation refusée
const DEFAULT_LOCATION: LatLng = { lat: 48.8566, lng: 2.3522 };

interface UseGpsSimulationReturn {
  parentLocation: LatLng;
  childLocation: LatLng;
  distance: number;
  setParentLocation: (location: LatLng) => void;
  setChildLocation: (location: LatLng) => void;
  recenter: () => void;
}

export function useGpsSimulation(): UseGpsSimulationReturn {
  const [parentLocation, setParentLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [childLocation, setChildLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [distance, setDistance] = useState<number>(0);

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

          // Générer position enfant à ~50-100m (pour démo)
          const newChildLocation = generateRandomLocation(newParentLocation, 50, 100);
          setChildLocation(newChildLocation);

          // Calculer distance
          const dist = calculateDistance(newParentLocation, newChildLocation);
          setDistance(dist);
        },
        (error) => {
          logger.info('Geolocation denied, using default location', { error: error.message });
          // Générer position enfant depuis position par défaut à ~50-100m (pour démo)
          const newChildLocation = generateRandomLocation(DEFAULT_LOCATION, 50, 100);
          setChildLocation(newChildLocation);
          setDistance(calculateDistance(DEFAULT_LOCATION, newChildLocation));
        }
      );
    } else {
      // Générer position enfant depuis position par défaut à ~50-100m (pour démo)
      const newChildLocation = generateRandomLocation(DEFAULT_LOCATION, 50, 100);
      setChildLocation(newChildLocation);
      setDistance(calculateDistance(DEFAULT_LOCATION, newChildLocation));
    }
  }, []);

  // Simuler mouvement de l'enfant (visible sur carte)
  useEffect(() => {
    const interval = setInterval(() => {
      setChildLocation((prev) => {
        // Mouvement aléatoire visible (20-50m) - simule marche/trottinette
        const newLocation = generateRandomLocation(prev, 20, 50);
        const newDistance = calculateDistance(parentLocation, newLocation);
        setDistance(newDistance);
        return newLocation;
      });
    }, 5000); // Toutes les 5 secondes

    return () => clearInterval(interval);
  }, [parentLocation]);

  // Recentrer sur la position parent
  const recenter = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newParentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setParentLocation(newParentLocation);
        },
        (error) => {
          logger.warn('Geolocation error during recenter', { error: error.message });
        }
      );
    }
  }, []);

  return {
    parentLocation,
    childLocation,
    distance,
    setParentLocation,
    setChildLocation,
    recenter,
  };
}
