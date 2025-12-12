'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Phone, Lock, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { normalizePhoneNumber, generateEmailFromPhone } from '@/lib/auth-helpers';
import { GuestGuard } from '@/components/auth/GuestGuard';
import { QRScanner } from '@/components/scanner/QRScanner';

/**
 * PHASE 9 - PAGE DE LOGIN
 *
 * Page d'authentification classique avec numéro de téléphone et mot de passe
 * Utilise la logique "Email Invisible" : ${phone}@secureid.user
 */

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handlePhoneChange = (value: string) => {
    // Permettre uniquement les chiffres, espaces et +
    const cleaned = value.replace(/[^\d\s+]/g, '');
    setPhone(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation basique
    if (!phone.trim()) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setLoading(true);

    try {
      // Normaliser le numéro et générer l'email (utilise les mêmes helpers que l'inscription)
      const normalizedPhone = normalizePhoneNumber(phone);
      const generatedEmail = generateEmailFromPhone(normalizedPhone);

      logger.info('Login attempt', { phone: normalizedPhone, email: generatedEmail });

      // Authentification Firebase
      await signInWithEmailAndPassword(auth, generatedEmail, password);

      logger.info('Login successful', { phone: normalizedPhone });

      // Redirection vers le dashboard
      router.replace('/dashboard');
    } catch (err: unknown) {
      logger.error('Login error', { error: err, phone });

      // Messages d'erreur user-friendly
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Identifiants incorrects. Vérifiez votre numéro et mot de passe.');
          break;
        case 'auth/too-many-requests':
          setError('Trop de tentatives. Veuillez réessayer dans quelques minutes.');
          break;
        case 'auth/network-request-failed':
          setError('Erreur réseau. Vérifiez votre connexion internet.');
          break;
        default:
          setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    // Rediriger vers la page d'activation avec les données du QR
    // Format attendu: https://secureid.app/s/{slug} ou juste {id}?token={token}
    try {
      const url = new URL(data);
      // Si c'est une URL complète, extraire le path
      router.push(url.pathname + url.search);
    } catch {
      // Si ce n'est pas une URL, c'est probablement juste un ID
      // Rediriger vers /activate ou /s/{data}
      router.push(`/s/${data}`);
    }
  };

  return (
    <GuestGuard>
      {/* Scanner QR Modal */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQRScan}
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
      {/* Logo & Titre */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 shadow-lg shadow-brand-orange/20">
          <Shield className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">SecureID</h1>
        <p className="mt-2 text-slate-400">Connexion à votre espace</p>
      </div>

      {/* Formulaire de connexion */}
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">
            Connexion 🔐
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Numéro de Téléphone */}
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-300">
                Numéro de Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Ex: 70 12 34 56 ou +226 70 12 34 56"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white placeholder-slate-500 transition-colors focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  disabled={loading}
                  required
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Mot de Passe */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white placeholder-slate-500 transition-colors focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-orange py-3 font-semibold text-white transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion en cours...
                </span>
              ) : (
                'ACCÉDER AU TABLEAU DE BORD'
              )}
            </button>
          </form>

          {/* Scanner de bracelet */}
          <div className="mt-6 border-t border-slate-800 pt-6 text-center">
            <p className="text-sm text-slate-400">
              Nouveau chez SecureID ?
            </p>
            <button
              onClick={() => setShowScanner(true)}
              className="mt-2 inline-block text-brand-orange transition-colors hover:text-orange-400"
            >
              Scannez un bracelet pour activer →
            </button>
          </div>
        </div>
      </div>
      </div>
    </GuestGuard>
  );
}
