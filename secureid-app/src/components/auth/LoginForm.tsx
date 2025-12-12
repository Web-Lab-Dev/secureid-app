'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/activation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Eye, EyeOff, Phone, Lock, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/error-helpers';
import { Button } from '@/components/ui/button';

/**
 * PHASE 3B - FORMULAIRE DE CONNEXION
 *
 * Formulaire pour se connecter avec numéro + mot de passe
 */

interface LoginFormProps {
  /** Callback appelé après connexion réussie */
  onSuccess?: () => void;
  /** Callback pour basculer vers le formulaire d'inscription */
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const { signIn } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      await signIn(data);

      // Succès
      onSuccess?.();
    } catch (error: unknown) {
      setServerError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Titre */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Connexion</h2>
          <p className="text-gray-400">Accédez à votre compte SecureID</p>
        </div>

        {/* Erreur serveur */}
        {serverError && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        {/* Champ: Numéro de téléphone */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
            Numéro de téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="phoneNumber"
              type="tel"
              {...register('phoneNumber')}
              className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              placeholder="Ex: 72259827"
              disabled={isSubmitting}
              autoComplete="tel"
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Champ: Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="w-full pl-11 pr-11 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              placeholder="Votre mot de passe"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Bouton soumettre */}
        <Button type="submit" disabled={isSubmitting} variant="primary" size="md" fullWidth>
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>

        {/* Lien inscription */}
        {onSwitchToSignup && (
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              Pas encore de compte?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-brand-orange hover:underline font-medium"
              >
                Créer un compte
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
