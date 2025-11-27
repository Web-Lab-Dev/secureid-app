'use client';

import { useState } from 'react';
import { X, Loader2, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MedicalDocuments } from './MedicalDocuments';
import { verifyDoctorPin } from '@/actions/emergency-actions';

/**
 * PHASE 5 - PIN DIALOG
 *
 * Dialog pour l'accès au portail médecin
 * - Saisie PIN 4 chiffres
 * - Validation côté serveur
 * - Affichage documents médicaux si PIN correct
 */

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}

export function PinDialog({ isOpen, onClose, profileId }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [validatedPin, setValidatedPin] = useState<string | null>(null);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 4) {
      setError('Le code PIN doit contenir 4 chiffres');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyDoctorPin({ profileId, pin });

      if (result.success) {
        setIsUnlocked(true);
        setValidatedPin(pin);
        setPin('');
      } else {
        setError(result.error || 'Code PIN incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError(null);
    setIsUnlocked(false);
    setValidatedPin(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            Accès Personnel Médical
          </DialogTitle>
        </DialogHeader>

        {!isUnlocked ? (
          // Vue saisie PIN
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin" className="mb-2 block text-sm font-medium text-slate-300">
                Code PIN à 4 chiffres
              </label>
              <input
                id="pin"
                type="tel"
                inputMode="numeric"
                value={pin}
                onChange={handlePinChange}
                maxLength={4}
                autoFocus
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-center font-mono text-2xl tracking-widest text-white focus:border-blue-500 focus:outline-none"
                placeholder="••••"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || pin.length !== 4}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Vérification...
                </span>
              ) : (
                'Valider'
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              Code réservé au personnel médical autorisé
            </p>
          </form>
        ) : (
          // Vue documents (PIN validé)
          <div>
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
              <p className="text-sm text-green-500">✓ Accès autorisé</p>
            </div>

            {validatedPin && <MedicalDocuments profileId={profileId} pin={validatedPin} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
