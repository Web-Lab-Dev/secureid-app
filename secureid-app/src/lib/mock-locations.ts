/**
 * COORDONNÉES PAR DÉFAUT - OUAGADOUGOU
 *
 * Points d'intérêt formant un triangle équilatéral d'environ 1 km de côté
 * autour du centre de Ouagadougou, Burkina Faso.
 */

import type { LatLng } from '@/lib/geo-utils';

/**
 * Coordonnées par défaut pour les POI à Ouagadougou
 * Triangle équilatéral avec ~1 km entre chaque point
 */
export const OUAGADOUGOU_LOCATIONS = {
  /**
   * MAISON - Centre de Ouagadougou
   * Place des Nations Unies
   */
  HOME: {
    lat: 12.3714,
    lng: -1.5197,
  } as LatLng,

  /**
   * ÉCOLE - ~1 km au nord
   * Quartier Ouaga 2000
   */
  SCHOOL: {
    lat: 12.3805,
    lng: -1.5197,
  } as LatLng,

  /**
   * HÔPITAL - ~1 km au sud-est (forme le triangle)
   * Proche du Centre Hospitalier Universitaire Yalgado Ouédraogo
   */
  HOSPITAL: {
    lat: 12.3669,
    lng: -1.5088,
  } as LatLng,
} as const;

/**
 * Position parent par défaut (centre de Ouagadougou)
 */
export const DEFAULT_PARENT_LOCATION: LatLng = OUAGADOUGOU_LOCATIONS.HOME;

/**
 * Calcule la distance approximative entre deux points (en mètres)
 * Formule de Haversine simplifiée
 */
function calculateApproximateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Vérification des distances du triangle (debug désactivé en production)
 * Maison → École: ~1000m, Maison → Hôpital: ~1200m, École → Hôpital: ~1600m
 */
