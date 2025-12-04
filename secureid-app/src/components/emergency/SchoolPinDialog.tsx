'use client';

import { useState } from 'react';
import { X, Lock, GraduationCap } from 'lucide-react';
import { verifySchoolPin } from '@/actions/school-actions';

/**
 * PHASE 8 - SCHOOL PIN DIALOG
 *
 * Dialog de saisie du code PIN pour accéder au portail école
 */

interface SchoolPinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profileId: string;
}

export function SchoolPinDialog({
  isOpen,
  onClose,
  onSuccess,
  profileId,
}: SchoolPinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('Le code doit contenir 4 chiffres');
      return;
    }

    setLoading(true);

    try {
      const result = await verifySchoolPin({ profileId, pin });

      if (result.success) {
        setPin('');
        onSuccess();
      } else {
        setError(result.message || 'Code incorrect');
        setPin('');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    // Accepter uniquement les chiffres
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
      setError('');
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
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
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900 p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-500/20 p-3">
                <GraduationCap className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Contrôle École</h2>
                <p className="text-sm text-slate-400">Code PIN à 4 chiffres</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="school-pin" className="block text-sm font-medium text-slate-300">
                Code PIN École
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="school-pin"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d{4}"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-center text-2xl font-bold tracking-widest text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  autoFocus
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pin.length !== 4 || loading}
              className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Valider'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-4 rounded-lg bg-indigo-950/50 p-3">
            <p className="text-center text-xs text-indigo-300">
              🔒 Ce code permet de voir les personnes autorisées à récupérer l'enfant
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
