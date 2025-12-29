/**
 * Hook pour gérer les markers Google Maps avec cleanup approprié
 * Évite les memory leaks en nettoyant tous les event listeners
 */

import { useEffect, useRef } from 'react';
import type { PointOfInterest } from '@/lib/types/gps';
import { generatePoiSvg, encodeSvgToDataUrl } from '@/lib/constants/gps';

interface MarkerWithInfo {
  marker: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
  listener: google.maps.MapsEventListener;
}

interface UseGoogleMapsMarkersOptions {
  map: google.maps.Map | null;
  points: PointOfInterest[];
  onMarkerClick?: (poi: PointOfInterest) => void;
}

export function useGoogleMapsMarkers({
  map,
  points,
  onMarkerClick,
}: UseGoogleMapsMarkersOptions) {
  // Stocker les markers dans un ref pour cleanup
  const markersRef = useRef<Map<string, MarkerWithInfo>>(new Map());

  useEffect(() => {
    if (!map || points.length === 0) return;

    // Nettoyer les anciens markers
    markersRef.current.forEach(({ marker, infoWindow, listener }) => {
      google.maps.event.removeListener(listener);
      infoWindow.close();
      marker.setMap(null);
    });
    markersRef.current.clear();

    // Créer les nouveaux markers
    points.forEach((poi) => {
      // Créer le SVG icon
      const svgIcon = generatePoiSvg(poi.type);
      const svgUrl = encodeSvgToDataUrl(svgIcon);

      // Créer le marker
      const marker = new google.maps.Marker({
        map,
        position: poi.position,
        title: poi.name,
        icon: {
          url: svgUrl,
          scaledSize: new google.maps.Size(40, 52),
          anchor: new google.maps.Point(20, 52),
        },
        zIndex: 1000,
      });

      // Créer InfoWindow
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
              ${poi.icon} ${poi.name}
            </div>
            <div style="font-size: 12px; color: #64748b;">
              ${poi.type === 'HOME' ? 'Domicile' : poi.type === 'SCHOOL' ? 'Établissement scolaire' : 'Centre médical'}
            </div>
          </div>
        `,
      });

      // Ajouter event listener pour le click
      const listener = marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onMarkerClick?.(poi);
      });

      // Stocker pour cleanup
      markersRef.current.set(poi.id, { marker, infoWindow, listener });
    });

    // Cleanup au démontage
    return () => {
      markersRef.current.forEach(({ marker, infoWindow, listener }) => {
        google.maps.event.removeListener(listener);
        infoWindow.close();
        marker.setMap(null);
      });
      markersRef.current.clear();
    };
  }, [map, points, onMarkerClick]);

  return {
    // On pourrait exposer des méthodes ici si nécessaire
    markersCount: markersRef.current.size,
  };
}
