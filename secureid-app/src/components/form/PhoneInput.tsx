import { Phone } from 'lucide-react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface PhoneInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
}

/**
 * Champ de saisie de numéro de téléphone réutilisable
 * Formaté pour les numéros internationaux
 */
export function PhoneInput({
  id,
  label = "Numéro de téléphone",
  placeholder = "+221 77 123 45 67",
  register,
  error
}: PhoneInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>
        <input
          {...register}
          type="tel"
          id={id}
          placeholder={placeholder}
          autoComplete="tel"
          className={`w-full pl-10 pr-3 py-2 bg-slate-800 border ${
            error ? 'border-red-500' : 'border-slate-700'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent text-white placeholder-gray-500`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        Format: +221 XX XXX XX XX
      </p>
    </div>
  );
}
