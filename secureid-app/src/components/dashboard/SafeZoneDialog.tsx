'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, MapPin, Target, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SafeZoneDocument, SafeZoneFormData } from '@/types/safe-zone';
import { SAFE_ZONE_COLORS, SAFE_ZONE_ICONS } from '@/types/safe-zone';
import { createSafeZone, updateSafeZone } from '@/actions/safe-zone-actions';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

/**
 * SAFE ZONE DIALOG
 *
 * Dialog pour créer/éditer une zone de sécurité
 * Formulaire complet avec validation Zod
 */

interface SafeZoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  zone?: SafeZoneDocument | null;
  onSaved: () => void;
}

// Schéma de validation Zod
const SafeZoneSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(50, 'Maximum 50 caractères'),
  icon: z.string().min(1, 'Icône requise'),
  center: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  radius: z.number().min(100, 'Minimum 100m').max(5000, 'Maximum 5km'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
  alertDelay: z.number().min(1, 'Minimum 1 minute').max(60, 'Maximum 60 minutes'),
});

export function SafeZoneDialog({
  isOpen,
  onClose,
  profileId,
  zone,
  onSaved,
}: SafeZoneDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SafeZoneFormData>({
    resolver: zodResolver(SafeZoneSchema),
    defaultValues: {
      name: '',
      icon: '🏠',
      center: { lat: 12.3714, lng: -1.5197 }, // Ouagadougou par défaut
      radius: 500,
      color: SAFE_ZONE_COLORS.green,
      alertDelay: 2,
    },
  });

  // Charger position actuelle au mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          logger.warn('Geolocation denied', { error });
        }
      );
    }
  }, []);

  // Pré-remplir si édition
  useEffect(() => {
    if (zone) {
      reset({
        name: zone.name,
        icon: zone.icon,
        center: zone.center,
        radius: zone.radius,
        color: zone.color,
        alertDelay: zone.alertDelay,
      });
    } else {
      // Reset pour création
      reset({
        name: '',
        icon: '🏠',
        center: currentLocation || { lat: 12.3714, lng: -1.5197 },
        radius: 500,
        color: SAFE_ZONE_COLORS.green,
        alertDelay: 2,
      });
    }
  }, [zone, currentLocation, reset]);

  const watchedValues = watch();

  const onSubmit = async (data: SafeZoneFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading(zone ? 'Mise à jour...' : 'Création...');

    try {
      let result;

      if (zone) {
        // Édition
        result = await updateSafeZone(zone.id, profileId, data);
      } else {
        // Création
        result = await createSafeZone(profileId, data);
      }

      if (!result.success) {
        toast.error(result.error || 'Une erreur est survenue', { id: toastId });
        return;
      }

      toast.success(zone ? 'Zone mise à jour' : 'Zone créée avec succès', { id: toastId });
      onSaved();
      onClose();
    } catch (error) {
      logger.error('Error saving safe zone', { error, profileId });
      toast.error('Une erreur est survenue', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setValue('center', currentLocation);
      toast.success('Position actuelle utilisée');
    } else {
      toast.error('Position non disponible');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-900 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {zone ? 'Modifier la Zone' : 'Nouvelle Zone de Sécurité'}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Configurez les paramètres de la zone
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nom de la zone *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Ex: École Primaire, Maison, Parc"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Icône */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Icône *
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {SAFE_ZONE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setValue('icon', icon)}
                      className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl transition-all ${
                        watchedValues.icon === icon
                          ? 'bg-brand-orange scale-110 shadow-lg'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Centre zone */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Centre de la zone *
                </label>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Latitude</label>
                    <input
                      {...register('center.lat', { valueAsNumber: true })}
                      type="number"
                      step="0.000001"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Longitude</label>
                    <input
                      {...register('center.lng', { valueAsNumber: true })}
                      type="number"
                      step="0.000001"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={!currentLocation}
                  className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
                >
                  <Target className="h-4 w-4" />
                  Utiliser ma position actuelle
                </button>

                {errors.center && (
                  <p className="mt-1 text-sm text-red-400">Coordonnées invalides</p>
                )}
              </div>

              {/* Rayon */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rayon: {watchedValues.radius >= 1000 ? `${(watchedValues.radius / 1000).toFixed(1)} km` : `${watchedValues.radius} m`}
                </label>
                <input
                  {...register('radius', { valueAsNumber: true })}
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>100m</span>
                  <span>5km</span>
                </div>
                {errors.radius && (
                  <p className="mt-1 text-sm text-red-400">{errors.radius.message}</p>
                )}
              </div>

              {/* Couleur */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Couleur
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {Object.entries(SAFE_ZONE_COLORS).map(([name, colorHex]) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setValue('color', colorHex)}
                      className={`flex h-12 w-full items-center justify-center rounded-lg transition-all ${
                        watchedValues.color === colorHex
                          ? 'ring-4 ring-brand-orange scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorHex }}
                    >
                      {watchedValues.color === colorHex && (
                        <span className="text-2xl">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Délai alerte */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Délai avant alerte: {watchedValues.alertDelay} minute{watchedValues.alertDelay > 1 ? 's' : ''}
                </label>
                <input
                  {...register('alertDelay', { valueAsNumber: true })}
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1 min</span>
                  <span>60 min</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Vous recevrez une alerte si l'enfant reste hors de cette zone pendant plus de {watchedValues.alertDelay} minute{watchedValues.alertDelay > 1 ? 's' : ''}.
                </p>
                {errors.alertDelay && (
                  <p className="mt-1 text-sm text-red-400">{errors.alertDelay.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-orange/90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5" />
                      {zone ? 'Mettre à jour' : 'Créer la zone'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
