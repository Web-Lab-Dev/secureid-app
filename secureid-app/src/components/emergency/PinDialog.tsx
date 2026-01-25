'use client';

import { useState } from 'react';
import { X, Loader2, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MedicalDocuments } from './MedicalDocuments';
import { verifyDoctorPin } from '@/actions/emergency-actions';
import { Button } from '@/components/ui/button';

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
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
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
          <DialogTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-health-mint/20 p-2 animate-soft-bounce">
              <Lock className="h-5 w-5 text-health-mint" />
            </div>
            <span>Accès Personnel Médical 🩺</span>
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
                maxLength={6}
                autoFocus
                className="w-full rounded-xl border-2 border-health-mint/40 bg-slate-800 px-4 py-3 text-center font-mono text-2xl tracking-widest text-white focus:border-health-mint focus:outline-none focus:ring-2 focus:ring-health-mint/30"
                placeholder="••••"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isVerifying || pin.length !== 4}
              variant="health"
              size="md"
              fullWidth
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Valider'
              )}
            </Button>

            <p className="text-center text-xs text-health-teal/70">
              Code réservé au personnel médical autorisé
            </p>
          </form>
        ) : (
          // Vue documents (PIN validé)
          <div>
            <div className="mb-4 rounded-xl bg-health-mint/10 border-2 border-health-mint/30 p-3">
              <p className="text-sm text-health-mint">✓ Accès autorisé</p>
            </div>

            {validatedPin && <MedicalDocuments profileId={profileId} pin={validatedPin} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
