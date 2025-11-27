import { useState, useCallback } from 'react';
import type { GeolocationData, GeolocationError } from '@/types/scan';

/**
 * PHASE 5 - GEOLOCATION HOOK
 *
 * Hook React pour gérer la géolocalisation du navigateur
 * Gère les permissions, erreurs, et états de chargement
 */

interface UseGeolocationReturn {
  /** Données de géolocalisation (lat, lng, accuracy) */
  data: GeolocationData | null;

  /** Erreur si géolocalisation échouée */
  error: GeolocationError | null;

  /** État de chargement */
  isLoading: boolean;

  /** Fonction pour demander la localisation */
  requestLocation: () => void;

  /** Réinitialiser l'état */
  reset: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [data, setData] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'La géolocalisation n\'est pas supportée par ce navigateur',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setData({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setIsLoading(false);
      },
      (err) => {
        let message = 'Erreur de géolocalisation';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Permission de géolocalisation refusée';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Position non disponible';
            break;
          case err.TIMEOUT:
            message = 'Délai d\'attente dépassé';
            break;
        }

        setError({
          code: err.code,
          message,
        });
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    requestLocation,
    reset,
  };
}
