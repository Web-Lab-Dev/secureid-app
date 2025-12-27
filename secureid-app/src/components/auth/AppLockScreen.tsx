'use client';

import { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * APP LOCK SCREEN
 *
 * Écran de verrouillage qui demande le mot de passe
 * - S'affiche quand l'utilisateur revient sur l'app après l'avoir quittée
 * - Utilise le même mot de passe que la connexion
 */

export function AppLockScreen() {
  const { user } = useAuthContext();
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    // Vérifier si l'app a été verrouillée
    const lockTime = localStorage.getItem('app-lock-time');
    const now = Date.now();

    // Verrouiller si l'utilisateur a quitté l'app il y a plus de 30 secondes
    if (lockTime && (now - parseInt(lockTime)) > 30000) {
      setIsLocked(true);
    }

    // Détecter quand l'utilisateur quitte/revient sur l'app
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // L'utilisateur quitte l'app
        localStorage.setItem('app-lock-time', Date.now().toString());
      } else {
        // L'utilisateur revient
        const lockTime = localStorage.getItem('app-lock-time');
        const now = Date.now();

        if (lockTime && (now - parseInt(lockTime)) > 30000) {
          setIsLocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnlocking(true);

    if (!user?.email) {
      setError('Impossible de déverrouiller');
      setIsUnlocking(false);
      return;
    }

    try {
      // Vérifier le mot de passe en tentant une connexion
      await signInWithEmailAndPassword(auth, user.email, password);

      // Déverrouiller
      setIsLocked(false);
      setPassword('');
      localStorage.removeItem('app-lock-time');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Mot de passe incorrect');
      } else {
        setError('Erreur de déverrouillage');
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!isLocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        <div className="w-full max-w-md px-4">
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-700 bg-slate-900/50 p-8 backdrop-blur-xl"
          >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-600">
                <Lock className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center text-2xl font-bold text-white">
              Application Verrouillée
            </h2>
            <p className="mb-6 text-center text-sm text-slate-400">
              Entrez votre mot de passe pour déverrouiller
            </p>

            {/* Form */}
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                  autoFocus
                />
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3"
                >
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-500">{error}</p>
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isUnlocking || !password}
                className="w-full rounded-lg bg-gradient-to-r from-brand-orange to-orange-600 py-3 font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUnlocking ? 'Déverrouillage...' : 'Déverrouiller'}
              </button>
            </form>

            {/* User info */}
            {user?.email && (
              <p className="mt-6 text-center text-xs text-slate-500">
                Connecté en tant que {user.email}
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
