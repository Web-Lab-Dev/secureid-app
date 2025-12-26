/**
 * PHASE 15 - UTILITAIRES GÉOLOCALISATION
 *
 * Fonctions pour :
 * - Générer positions aléatoires à distance donnée
 * - Calculer distance entre 2 points GPS
 * - Calculer temps estimé de trajet
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Génère une position aléatoire à une distance donnée d'un point d'origine
 * @param origin Point d'origine
 * @param minDistance Distance minimale en mètres
 * @param maxDistance Distance maximale en mètres
 * @returns Nouvelle position aléatoire
 */
export function generateRandomLocation(
  origin: LatLng,
  minDistance: number,
  maxDistance: number
): LatLng {
  // Rayon de la Terre en mètres
  const R = 6371000;

  // Distance aléatoire entre min et max
  const distance = Math.random() * (maxDistance - minDistance) + minDistance;

  // Angle aléatoire (0-360°)
  const bearing = Math.random() * 2 * Math.PI;

  // Conversion en radians
  const lat1 = (origin.lat * Math.PI) / 180;
  const lng1 = (origin.lng * Math.PI) / 180;

  // Calcul nouvelle latitude
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearing)
  );

  // Calcul nouvelle longitude
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI,
  };
}

/**
 * Calcule la distance entre deux points GPS (formule Haversine)
 * @param point1 Premier point
 * @param point2 Deuxième point
 * @returns Distance en mètres
 */
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371000; // Rayon de la Terre en mètres

  const lat1 = (point1.lat * Math.PI) / 180;
  const lat2 = (point2.lat * Math.PI) / 180;
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calcule le temps estimé de trajet à pied
 * @param distance Distance en mètres
 * @returns Temps formaté (ex: "12 min")
 */
export function calculateETA(distance: number): string {
  // Vitesse de marche moyenne : 5 km/h = 83.33 m/min
  const walkingSpeedMetersPerMin = 83.33;
  const minutes = Math.ceil(distance / walkingSpeedMetersPerMin);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (remainingMins === 0) {
    return `${hours}h`;
  }

  return `${hours}h${remainingMins}`;
}

/**
 * Formate une distance en format lisible
 * @param distance Distance en mètres
 * @returns Distance formatée (ex: "850 m" ou "1.2 km")
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(distance / 1000).toFixed(1)} km`;
}
