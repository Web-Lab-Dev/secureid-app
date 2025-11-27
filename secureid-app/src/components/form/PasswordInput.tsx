'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface PasswordInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  autoComplete?: string;
}

/**
 * Champ de saisie de mot de passe réutilisable
 * Avec bouton pour afficher/masquer le mot de passe
 */
export function PasswordInput({
  id,
  label = "Mot de passe",
  placeholder = "Votre mot de passe",
  register,
  error,
  autoComplete = "current-password"
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          {...register}
          type={showPassword ? 'text' : 'password'}
          id={id}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full pl-10 pr-10 py-2 bg-slate-800 border ${
            error ? 'border-red-500' : 'border-slate-700'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent text-white placeholder-gray-500`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
