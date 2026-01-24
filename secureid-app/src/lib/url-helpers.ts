/**
 * URL Helpers - Fonctions utilitaires pour la génération d'URLs
 */

export interface BraceletParams {
  id?: string;
  token?: string;
  welcome?: boolean;
}

/**
 * Construit l'URL d'activation avec les paramètres du bracelet si disponibles
 * Utilisé sur la landing page (Header, HeroSection, StickyBar, CTASection)
 *
 * @param braceletParams - Paramètres du bracelet scannés depuis l'URL
 * @returns URL d'activation ou de login
 */
export function getActivateUrl(braceletParams?: BraceletParams): string {
  if (braceletParams?.id && braceletParams?.token) {
    return `/activate?id=${braceletParams.id}&token=${braceletParams.token}`;
  }
  return '/login';
}

/**
 * Extrait les coordonnées GPS d'un lien Google Maps
 * Supporte plusieurs formats de liens Google Maps
 *
 * @param url - URL Google Maps à parser
 * @returns Coordonnées {lat, lng} ou null si non trouvées
 *
 * @example
 * parseGoogleMapsUrl("https://maps.google.com/?q=12.3714,-1.5197")
 * // => { lat: 12.3714, lng: -1.5197 }
 *
 * parseGoogleMapsUrl("https://www.google.com/maps/place/.../@12.3714,-1.5197,17z")
 * // => { lat: 12.3714, lng: -1.5197 }
 */
export function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    // Pattern 1: @lat,lng (le plus commun)
    const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const atMatch = url.match(atPattern);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    // Pattern 2: ?q=lat,lng ou &q=lat,lng
    const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const qMatch = url.match(qPattern);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }

    // Pattern 3: /place/lat,lng ou destination=lat,lng
    const placePattern = /(?:place|destination)[=/](-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const placeMatch = url.match(placePattern);
    if (placeMatch) {
      return { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) };
    }

    return null;
  } catch {
    return null;
  }
}
