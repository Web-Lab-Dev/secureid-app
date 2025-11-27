'use client';

import { useState } from 'react';
import { Eye, EyeOff, Edit2, Check, X, Loader2 } from 'lucide-react';
import { updateProfile } from '@/actions/profile-actions';
import type { ProfileDocument } from '@/types/profile';
import { logger } from '@/lib/logger';

/**
 * PHASE 4C - GESTION CODE PIN MÉDECIN
 *
 * Permet de voir et modifier le code PIN médecin
 * - Affichage masqué par défaut
 * - Toggle pour révéler
 * - Mode édition pour changer le PIN
 */

interface PinManagementProps {
  profile: ProfileDocument;
}

export function PinManagement({ profile }: PinManagementProps) {
  const [showPin, setShowPin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSavePin = async () => {
    setError(null);

    // Validation
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('Le PIN doit contenir exactement 4 chiffres');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Les codes PIN ne correspondent pas');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProfile({
        profileId: profile.id,
        updates: {
          doctorPin: newPin,
        },
      });

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      setSuccess(true);
      setIsEditing(false);
      setNewPin('');
      setConfirmPin('');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating PIN:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewPin('');
    setConfirmPin('');
    setError(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Nouveau code PIN (4 chiffres)
          </label>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white font-mono text-center text-2xl tracking-widest focus:border-brand-orange focus:outline-none"
            placeholder="••••"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Confirmer le code PIN
          </label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white font-mono text-center text-2xl tracking-widest focus:border-brand-orange focus:outline-none"
            placeholder="••••"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSavePin}
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </button>

          <button
            onClick={handleCancelEdit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
          <p className="text-sm text-green-500">✓ Code PIN mis à jour avec succès</p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg bg-slate-900 p-4">
        <div>
          <p className="text-sm text-slate-400">Code PIN actuel</p>
          <p className="mt-1 font-mono text-2xl tracking-widest text-white">
            {showPin ? profile.doctorPin : '••••'}
          </p>
        </div>

        <button
          onClick={() => setShowPin(!showPin)}
          className="rounded-lg bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          aria-label={showPin ? 'Masquer le PIN' : 'Afficher le PIN'}
        >
          {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      <button
        onClick={() => setIsEditing(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
      >
        <Edit2 className="h-4 w-4" />
        Modifier le code PIN
      </button>
    </div>
  );
}
