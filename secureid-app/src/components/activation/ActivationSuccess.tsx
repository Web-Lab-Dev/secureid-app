'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Home, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface ActivationSuccessProps {
  /** Nom de l'enfant dont le profil a été activé */
  childName: string;
  /** ID du bracelet lié */
  braceletId: string;
  /** Mode: 'new' pour nouveau profil, 'transfer' pour transfert */
  mode: 'new' | 'transfer';
}

/**
 * PHASE 3E - COMPOSANT SUCCÈS ACTIVATION
 *
 * Écran de confirmation après activation réussie d'un bracelet
 * Avec animation et actions suivantes
 */
export function ActivationSuccess({
  childName,
  braceletId,
  mode,
}: ActivationSuccessProps) {
  const router = useRouter();

  // Générer les particules une seule fois au montage
  const particles = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      x: 50 + (Math.random() - 0.5) * 100,
      y: 50 + (Math.random() - 0.5) * 100,
      duration: 1 + Math.random(),
      delay: 0.3 + Math.random() * 0.3,
      left: Math.random() * 100,
      top: Math.random() * 100,
    })),
    []
  );

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleScanAnother = () => {
    router.push('/activate');
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900 rounded-lg p-8 space-y-6 text-center border-2 border-green-500">
          {/* Icône de succès animée */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 200,
              damping: 10,
            }}
            className="flex justify-center"
          >
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </motion.div>

          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-white">
              {mode === 'new' ? 'Activation réussie !' : 'Transfert réussi !'}
            </h1>
            <p className="text-lg text-gray-300">
              {mode === 'new' ? (
                <>
                  Le profil de <span className="font-semibold text-brand-orange">{childName}</span> a
                  été créé et lié au bracelet.
                </>
              ) : (
                <>
                  Le bracelet de <span className="font-semibold text-brand-orange">{childName}</span>{' '}
                  a été transféré avec succès.
                </>
              )}
            </p>
          </motion.div>

          {/* Informations du bracelet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-800 rounded-lg p-4 border border-slate-700"
          >
            <p className="text-sm text-gray-400 mb-1">Bracelet ID</p>
            <p className="text-2xl font-mono font-bold text-brand-orange">{braceletId}</p>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-left"
          >
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Prochaines étapes:</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Le bracelet est maintenant actif</li>
              <li>En cas d'urgence, scannez le QR code</li>
              <li>Les informations médicales seront accessibles avec le code PIN</li>
              <li>Vous pouvez gérer le profil depuis le tableau de bord</li>
            </ul>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3 pt-4"
          >
            <Button
              onClick={handleGoHome}
              variant="primary"
              size="lg"
              fullWidth
            >
              <Home className="w-5 h-5" />
              Retour au tableau de bord
            </Button>

            <Button
              onClick={handleScanAnother}
              variant="secondary"
              size="lg"
              fullWidth
            >
              <QrCode className="w-5 h-5" />
              Activer un autre bracelet
            </Button>
          </motion.div>
        </div>

        {/* Animation confetti (optionnel - peut être ajouté avec react-confetti) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 2 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Particules de célébration */}
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                x: '50%',
                y: '50%',
              }}
              animate={{
                opacity: 0,
                x: `${particle.x}%`,
                y: `${particle.y}%`,
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
              }}
              className="absolute w-2 h-2 bg-brand-orange rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
