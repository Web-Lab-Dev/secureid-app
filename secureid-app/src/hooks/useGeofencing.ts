/**
 * Hook pour la gestion du geofencing (zone de sécurité)
 * Détecte quand l'enfant sort de la zone et déclenche des alertes
 */

import { useState, useEffect, useRef } from 'react';
import { calculateDistance, type LatLng } from '@/lib/geo-utils';

interface UseGeofencingOptions {
  /** Rayon de la zone de sécurité en mètres */
  radius: number;
  /** Délai avant alerte en millisecondes (défaut: 60000 = 1 minute) */
  alertDelay?: number;
}

interface UseGeofencingReturn {
  isInSafeZone: boolean;
  showSecurityAlert: boolean;
  dismissAlert: () => void;
}

export function useGeofencing(
  parentLocation: LatLng,
  childLocation: LatLng,
  options: UseGeofencingOptions
): UseGeofencingReturn {
  const { radius, alertDelay = 60000 } = options;

  const [isInSafeZone, setIsInSafeZone] = useState<boolean>(true);
  const [showSecurityAlert, setShowSecurityAlert] = useState<boolean>(false);

  // Utiliser useRef au lieu de useState pour le timer (évite re-renders inutiles)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier si enfant dans zone
  useEffect(() => {
    const dist = calculateDistance(parentLocation, childLocation);
    const inZone = dist <= radius;
    const wasInZone = isInSafeZone;

    setIsInSafeZone(inZone);

    // Si l'enfant SORT de la zone (transition sûre → hors zone)
    if (wasInZone && !inZone) {
      // Démarrer le timer d'alerte
      timerRef.current = setTimeout(() => {
        setShowSecurityAlert(true);
      }, alertDelay);
    }

    // Si l'enfant RENTRE dans la zone
    if (!wasInZone && inZone) {
      // Annuler le timer et réinitialiser l'alerte
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShowSecurityAlert(false);
    }
  }, [parentLocation, childLocation, radius, alertDelay, isInSafeZone]);

  // Cleanup du timer au démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Fonction pour dismiss l'alerte manuellement
  const dismissAlert = () => {
    setShowSecurityAlert(false);
  };

  return {
    isInSafeZone,
    showSecurityAlert,
    dismissAlert,
  };
}
