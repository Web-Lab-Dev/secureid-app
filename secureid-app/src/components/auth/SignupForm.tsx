'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/schemas/activation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Eye, EyeOff, Phone, Lock, User, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/error-helpers';
import { Button } from '@/components/ui/button';

/**
 * PHASE 3B - FORMULAIRE D'INSCRIPTION
 *
 * Formulaire pour créer un nouveau compte parent
 * Utilise le système "magic email" (numéro → email généré)
 */

interface SignupFormProps {
  /** Callback appelé après inscription réussie */
  onSuccess?: () => void;
  /** Callback pour basculer vers le formulaire de connexion */
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const { signUp } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      await signUp({
        phoneNumber: data.phoneNumber,
        password: data.password,
        displayName: data.displayName,
      });

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
          <h2 className="text-3xl font-bold text-white mb-2">Créer un compte</h2>
          <p className="text-gray-400">Protégez votre enfant en quelques minutes</p>
        </div>

        {/* Erreur serveur */}
        {serverError && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        {/* Champ: Nom complet */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
            Votre nom complet
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="displayName"
              type="text"
              {...register('displayName')}
              className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              placeholder="Ex: Sawadogo Malick"
              disabled={isSubmitting}
            />
          </div>
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-400">{errors.displayName.message}</p>
          )}
        </div>

        {/* Champ: WhatsApp (Numéro de téléphone) */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
            WhatsApp (Numéro de téléphone)
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
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.phoneNumber.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Ce numéro sera utilisé pour WhatsApp • Format: 8 chiffres (Ex: 72259827)
          </p>
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
              placeholder="Minimum 8 caractères"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Champ: Confirmation mot de passe */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className="w-full pl-11 pr-11 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              placeholder="Répétez le mot de passe"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Bouton soumettre */}
        <Button type="submit" disabled={isSubmitting} variant="primary" size="md" fullWidth>
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Création du compte...
            </>
          ) : (
            'Créer mon compte'
          )}
        </Button>

        {/* Lien connexion */}
        {onSwitchToLogin && (
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              Vous avez déjà un compte?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-brand-orange hover:underline font-medium"
              >
                Se connecter
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
