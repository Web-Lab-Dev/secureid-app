'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { X, Upload, Calendar, User } from 'lucide-react';
import Image from 'next/image';
import { addPickup } from '@/actions/school-actions';
import type { PickupType } from '@/types/profile';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { Button } from '@/components/ui/button';

/**
 * PHASE 8 - ADD PICKUP DIALOG
 *
 * Dialog pour ajouter un récupérateur autorisé
 * - Upload photo obligatoire
 * - Option pass temporaire avec date d'expiration
 */

interface AddPickupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}

export function AddPickupDialog({ isOpen, onClose, profileId }: AddPickupDialogProps) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [type, setType] = useState<PickupType>('PERMANENT');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Hook pour la gestion de la photo (max 5MB pour pickup)
  const { photoFile, photoPreview, error: photoError, handlePhotoChange, resetPhoto } = usePhotoUpload({ maxSizeMB: 5 });

  // Combiner les erreurs pour l'affichage
  const error = formError || photoError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!name.trim()) {
      setFormError('Le nom est requis');
      return;
    }

    if (!relation.trim()) {
      setFormError('La relation est requise');
      return;
    }

    if (!photoFile) {
      setFormError('La photo est obligatoire');
      return;
    }

    if (type === 'TEMPORARY' && !expiresAt) {
      setFormError('La date d\'expiration est requise pour un pass temporaire');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload de la photo côté client
      const storageRef = ref(storage, `pickup_photos/${profileId}/${Date.now()}_${photoFile.name}`);
      const uploadResult = await uploadBytes(storageRef, photoFile);
      const photoUrl = await getDownloadURL(uploadResult.ref);

      // 2. Appeler l'action serveur avec l'URL de la photo
      const result = await addPickup({
        profileId,
        name: name.trim(),
        relation: relation.trim(),
        photoUrl,
        type,
        expiresAt: type === 'TEMPORARY' ? expiresAt : undefined,
      });

      if (result.success) {
        // Reset et fermer
        handleClose();
      } else {
        setFormError(result.message || 'Erreur lors de l\'ajout');
      }
    } catch (err) {
      logger.error('Error adding pickup:', err);
      setFormError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setRelation('');
    setType('PERMANENT');
    setExpiresAt('');
    resetPhoto();
    setFormError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900 p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Ajouter un Récupérateur</h2>
              <p className="text-sm text-slate-400">Personne autorisée à récupérer l'enfant</p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload Photo */}
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Photo du visage <span className="text-red-400">*</span>
              </label>
              <p className="mb-2 text-xs text-slate-500">
                Photo claire pour identification visuelle par le vigile
              </p>

              {photoPreview ? (
                <div className="group relative mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-indigo-400">
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={resetPhoto}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <span className="text-sm font-semibold text-white">Changer</span>
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 py-8 transition-colors hover:border-indigo-500">
                  <Upload className="h-12 w-12 text-slate-500" />
                  <p className="mt-2 text-sm font-medium text-slate-400">Cliquer pour uploader</p>
                  <p className="text-xs text-slate-500">PNG, JPG (max 5MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              )}
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                Nom complet <span className="text-red-400">*</span>
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tonton Moussa"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Relation */}
            <div>
              <label htmlFor="relation" className="block text-sm font-medium text-slate-300">
                Relation <span className="text-red-400">*</span>
              </label>
              <select
                id="relation"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 py-2 px-4 text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                disabled={loading}
                required
              >
                <option value="">Sélectionner...</option>
                <option value="Oncle">Oncle</option>
                <option value="Tante">Tante</option>
                <option value="Grand-parent">Grand-parent</option>
                <option value="Chauffeur">Chauffeur</option>
                <option value="Voisin(e)">Voisin(e)</option>
                <option value="Ami(e) de la famille">Ami(e) de la famille</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Type de Pass */}
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Type de pass
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setType('PERMANENT');
                    setExpiresAt('');
                  }}
                  className={`rounded-lg border-2 py-3 text-sm font-semibold transition-all ${
                    type === 'PERMANENT'
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                  disabled={loading}
                >
                  Permanent
                </button>
                <button
                  type="button"
                  onClick={() => setType('TEMPORARY')}
                  className={`rounded-lg border-2 py-3 text-sm font-semibold transition-all ${
                    type === 'TEMPORARY'
                      ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                  disabled={loading}
                >
                  Temporaire
                </button>
              </div>
            </div>

            {/* Date d'expiration (si temporaire) */}
            {type === 'TEMPORARY' && (
              <div>
                <label htmlFor="expires" className="block text-sm font-medium text-slate-300">
                  Valide jusqu'au <span className="text-red-400">*</span>
                </label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="expires"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    disabled={loading}
                    required={type === 'TEMPORARY'}
                  />
                </div>
                <p className="mt-1 text-xs text-yellow-400">
                  Le pass sera automatiquement retiré après expiration
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                size="sm"
                className="flex-1 border-slate-700 text-slate-400"
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || !photoFile}
                variant="indigo"
                size="sm"
                className="flex-1"
              >
                {loading ? 'Ajout en cours...' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
