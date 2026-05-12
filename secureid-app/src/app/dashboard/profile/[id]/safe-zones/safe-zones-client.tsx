'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2, MapPin } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Circle, Marker } from '@react-google-maps/api';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import type { ProfileDocument } from '@/types/profile';
import type { SafeZoneDocument } from '@/types/safe-zone';
import { SafeZoneList } from '@/components/dashboard/SafeZoneList';
import { SafeZoneDialog } from '@/components/dashboard/SafeZoneDialog';
import { db } from '@/lib/firebase';
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

  // Souscription temps réel aux zones (auto-update après create/update/delete)
  useEffect(() => {
    const zonesRef = collection(db, 'profiles', profile.id, 'safeZones');
    const q = query(zonesRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedZones: SafeZoneDocument[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            profileId: data.profileId,
            name: data.name,
            icon: data.icon,
            center: { lat: data.center.lat, lng: data.center.lng },
            radius: data.radius,
            color: data.color,
            enabled: data.enabled ?? true,
            alertDelay: data.alertDelay,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        setZones(fetchedZones);
        setLoading(false);
      },
      (error) => {
        logger.error('Error subscribing to safe zones', { error, profileId: profile.id });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [profile.id]);

  // Sélectionner la première zone par défaut une fois chargée
  useEffect(() => {
    if (zones.length > 0 && !selectedZone) {
      setSelectedZone(zones[0]);
      setMapCenter(zones[0].center);
    }
  }, [zones, selectedZone]);

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

  const handleZoneSaved = (createdZone?: SafeZoneDocument) => {
    setIsDialogOpen(false);
    setEditingZone(null);
    // Update optimiste: ajoute immédiatement la zone créée à l'état
    // (la souscription onSnapshot la remplacera quand elle se synchronisera)
    if (createdZone) {
      setZones((prev) => {
        if (prev.some((z) => z.id === createdZone.id)) return prev;
        return [createdZone, ...prev];
      });
      setSelectedZone(createdZone);
      setMapCenter(createdZone.center);
    }
  };

  const handleZoneDeleted = () => {
    setSelectedZone(null);
    // onSnapshot mettra automatiquement à jour la liste
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
      <div className="overflow-hidden rounded-t-2xl border border-slate-800 bg-slate-900">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/profile/${profile.id}/tracking`)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Zones de Sécurité
              </h1>
              <p className="truncate text-sm text-slate-400">{profile.fullName}</p>
            </div>
          </div>

          <button
            onClick={handleAddZone}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-orange/90 sm:w-auto sm:py-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter une Zone
          </button>
        </div>
      </div>

      {/* Layout: mobile empilé, desktop liste + carte */}
      <div className="grid min-h-0 overflow-hidden rounded-b-2xl border-x border-b border-slate-800 bg-slate-950 lg:h-[calc(100vh-220px)] lg:min-h-[560px] lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Liste des Zones */}
        <div className="min-w-0 overflow-y-auto border-b border-slate-800 bg-slate-900 lg:border-b-0 lg:border-r">
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
              profileId={profile.id}
            />
          )}
        </div>

        {/* Carte */}
        <div className="relative min-h-[420px] min-w-0 lg:min-h-0">
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
              <Marker position={selectedZone.center} title={selectedZone.name} />
            )}
          </GoogleMap>

          {/* Message si aucune zone */}
          {zones.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
              <div className="max-w-md text-center">
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
