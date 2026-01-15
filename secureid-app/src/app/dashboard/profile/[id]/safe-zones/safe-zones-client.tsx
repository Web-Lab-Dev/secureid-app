'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2, MapPin } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Circle } from '@react-google-maps/api';
import type { ProfileDocument } from '@/types/profile';
import type { SafeZoneDocument } from '@/types/safe-zone';
import { SafeZoneList } from '@/components/dashboard/SafeZoneList';
import { SafeZoneDialog } from '@/components/dashboard/SafeZoneDialog';
import { getSafeZonesClient } from '@/lib/safe-zones-client';
import { darkModeMapStyles } from '@/lib/map-styles';
import { logger } from '@/lib/logger';
import { DEFAULT_PARENT_LOCATION } from '@/lib/mock-locations';

/**
 * SAFE ZONES CLIENT
 *
 * Page client pour gérer les zones de sécurité
 * Layout: Liste à gauche (30%), carte à droite (70%)
 */

interface SafeZonesClientProps {
  profile: ProfileDocument;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = DEFAULT_PARENT_LOCATION;

export function SafeZonesClient({ profile }: SafeZonesClientProps) {
  const router = useRouter();
  const [zones, setZones] = useState<SafeZoneDocument[]>([]);
  const [selectedZone, setSelectedZone] = useState<SafeZoneDocument | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<SafeZoneDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Charger Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Charger les zones au mount
  useEffect(() => {
    loadZones();
  }, [profile.id]);

  const loadZones = async () => {
    try {
      setLoading(true);
      const fetchedZones = await getSafeZonesClient(profile.id);
      setZones(fetchedZones);

      // Sélectionner la première zone par défaut
      if (fetchedZones.length > 0 && !selectedZone) {
        setSelectedZone(fetchedZones[0]);
        setMapCenter(fetchedZones[0].center);
      }
    } catch (error) {
      logger.error('Error loading safe zones', { error, profileId: profile.id });
    } finally {
      setLoading(false);
    }
  };

  const handleZoneSelect = (zone: SafeZoneDocument) => {
    setSelectedZone(zone);
    setMapCenter(zone.center);

    // Animer vers la zone sélectionnée
    if (mapRef) {
      mapRef.panTo(zone.center);
      mapRef.setZoom(15);
    }
  };

  const handleAddZone = () => {
    setEditingZone(null);
    setIsDialogOpen(true);
  };

  const handleEditZone = (zone: SafeZoneDocument) => {
    setEditingZone(zone);
    setIsDialogOpen(true);
  };

  const handleZoneSaved = () => {
    setIsDialogOpen(false);
    setEditingZone(null);
    loadZones(); // Recharger les zones
  };

  const handleZoneDeleted = () => {
    setSelectedZone(null);
    loadZones(); // Recharger les zones
  };

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <MapPin className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-white">Erreur Google Maps</h3>
          <p className="mt-2 text-sm text-slate-400">
            Impossible de charger Google Maps. Vérifiez votre connexion internet et la clé API.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/profile/${profile.id}/tracking`)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                Zones de Sécurité
              </h1>
              <p className="text-sm text-slate-400">{profile.fullName}</p>
            </div>
          </div>

          <button
            onClick={handleAddZone}
            className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-orange/90"
          >
            <Plus className="h-5 w-5" />
            Ajouter une Zone
          </button>
        </div>
      </div>

      {/* Layout: Sidebar + Carte */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Gauche - Liste des Zones (30%) */}
        <div className="w-full md:w-[400px] border-r border-slate-800 bg-slate-900 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
            </div>
          ) : (
            <SafeZoneList
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={handleZoneSelect}
              onEditZone={handleEditZone}
              onZoneDeleted={handleZoneDeleted}
            />
          )}
        </div>

        {/* Carte Droite (70%) */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={selectedZone ? 15 : 13}
            options={{
              styles: darkModeMapStyles,
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true,
            }}
            onLoad={(map) => setMapRef(map)}
          >
            {/* Afficher tous les cercles des zones */}
            {zones.filter(z => z.enabled).map((zone) => (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                options={{
                  fillColor: zone.color,
                  fillOpacity: selectedZone?.id === zone.id ? 0.25 : 0.15,
                  strokeColor: zone.color,
                  strokeOpacity: selectedZone?.id === zone.id ? 1 : 0.6,
                  strokeWeight: selectedZone?.id === zone.id ? 3 : 2,
                  clickable: true,
                }}
                onClick={() => handleZoneSelect(zone)}
              />
            ))}

            {/* Marqueur centre de la zone sélectionnée */}
            {selectedZone && (
              <div
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-lg border-2"
                    style={{
                      backgroundColor: selectedZone.color,
                      borderColor: 'white',
                    }}
                  >
                    {selectedZone.icon}
                  </div>
                  <div className="mt-1 rounded bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow">
                    {selectedZone.name}
                  </div>
                </div>
              </div>
            )}
          </GoogleMap>

          {/* Message si aucune zone */}
          {zones.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
              <div className="text-center max-w-md p-8">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-orange/20">
                  <MapPin className="h-10 w-10 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Aucune Zone de Sécurité
                </h3>
                <p className="text-slate-400 mb-6">
                  Créez votre première zone de sécurité pour recevoir des alertes lorsque {profile.fullName} sort du périmètre défini.
                </p>
                <button
                  onClick={handleAddZone}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-orange/90"
                >
                  <Plus className="h-5 w-5" />
                  Créer une Zone
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog CRUD Zone */}
      <SafeZoneDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingZone(null);
        }}
        profileId={profile.id}
        zone={editingZone}
        onSaved={handleZoneSaved}
      />
    </>
  );
}
