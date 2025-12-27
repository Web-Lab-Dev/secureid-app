'use client';

import { useState } from 'react';
import { X, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GENERIC PIN DIALOG
 *
 * Composant réutilisable pour la saisie d'un code PIN à 4 chiffres
 * Utilisé par PinDialog (médecin) et SchoolPinDialog (école)
 */

interface GenericPinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  verifyFunction: (pin: string) => Promise<{ success: boolean; error?: string }>;
}

export function GenericPinDialog({
  isOpen,
  onClose,
  onSuccess,
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBgColor,
  verifyFunction,
}: GenericPinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4) {
      setError('Le code PIN doit contenir 4 chiffres');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyFunction(pin);

      if (result.success) {
        onSuccess();
        onClose();
        setPin('');
      } else {
        setError(result.error || 'Code PIN incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full ${iconBgColor}`}>
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-center text-2xl font-bold text-slate-900">
                  {title}
                </h2>
                <p className="mb-8 text-center text-slate-600">
                  {subtitle}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* PIN Input */}
                  <div>
                    <label htmlFor="pin" className="mb-2 block text-sm font-medium text-slate-700">
                      Code PIN à 4 chiffres
                    </label>
                    <input
                      type="text"
                      id="pin"
                      value={pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPin(value);
                        setError('');
                      }}
                      maxLength={4}
                      placeholder="••••"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-widest focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                      autoFocus
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || pin.length !== 4}
                    className="w-full rounded-lg bg-brand-orange py-3 font-semibold text-white transition-colors hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Vérification...' : 'Vérifier'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
