'use client';

import { useState } from 'react';
import { Edit3, Trash2, MapPin, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SafeZoneDocument } from '@/types/safe-zone';
import { deleteSafeZone, toggleSafeZone } from '@/actions/safe-zone-actions';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

/**
 * SAFE ZONE LIST
 *
 * Liste des zones de sécurité dans la sidebar
 * Affiche les détails, permet sélection, édition, suppression
 */

interface SafeZoneListProps {
  zones: SafeZoneDocument[];
  selectedZone: SafeZoneDocument | null;
  onSelectZone: (zone: SafeZoneDocument) => void;
  onEditZone: (zone: SafeZoneDocument) => void;
  onZoneDeleted: () => void;
}

export function SafeZoneList({
  zones,
  selectedZone,
  onSelectZone,
  onEditZone,
  onZoneDeleted,
}: SafeZoneListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (zone: SafeZoneDocument, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Supprimer la zone "${zone.name}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    setDeletingId(zone.id);
    const toastId = toast.loading('Suppression de la zone...');

    try {
      const result = await deleteSafeZone(zone.id);

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la suppression', { id: toastId });
        return;
      }

      toast.success(`Zone "${zone.name}" supprimée`, { id: toastId });
      onZoneDeleted();
    } catch (error) {
      logger.error('Error deleting safe zone', { error, zoneId: zone.id });
      toast.error('Une erreur est survenue', { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (zone: SafeZoneDocument, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const result = await toggleSafeZone(zone.id, !zone.enabled);

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la mise à jour');
        return;
      }

      toast.success(zone.enabled ? 'Zone désactivée' : 'Zone activée');
      onZoneDeleted(); // Recharger la liste
    } catch (error) {
      logger.error('Error toggling safe zone', { error, zoneId: zone.id });
      toast.error('Une erreur est survenue');
    }
  };

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
          <Shield className="h-8 w-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-white">Aucune Zone</h3>
        <p className="mt-2 text-sm text-slate-400">
          Créez votre première zone de sécurité pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Mes Zones ({zones.length})
        </h2>
      </div>

      {zones.map((zone, index) => {
        const isSelected = selectedZone?.id === zone.id;

        return (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              isSelected
                ? 'border-brand-orange bg-brand-orange/10 shadow-lg'
                : 'border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800'
            }`}
            onClick={() => onSelectZone(zone)}
          >
            {/* Header avec icône et toggle */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-md"
                  style={{
                    backgroundColor: zone.color + '40',
                    color: zone.color,
                  }}
                >
                  {zone.icon}
                </div>

                <div>
                  <h3 className="font-semibold text-white">{zone.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggle(zone, e)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        zone.enabled ? 'bg-green-500' : 'bg-slate-700'
                      }`}
                      aria-label={zone.enabled ? 'Désactiver' : 'Activer'}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          zone.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-slate-400">
                      {zone.enabled ? 'Activée' : 'Désactivée'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Infos zone */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>Rayon: {zone.radius >= 1000 ? `${(zone.radius / 1000).toFixed(1)} km` : `${zone.radius} m`}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>Alerte: {zone.alertDelay} minute{zone.alertDelay > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2 border-t border-slate-700 pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditZone(zone);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
              >
                <Edit3 className="h-4 w-4" />
                Modifier
              </button>

              <button
                onClick={(e) => handleDelete(zone, e)}
                disabled={deletingId === zone.id}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
