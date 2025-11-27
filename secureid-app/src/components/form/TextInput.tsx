import { LucideIcon } from 'lucide-react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface TextInputProps {
  id: string;
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  icon?: LucideIcon;
  type?: 'text' | 'email';
  autoComplete?: string;
}

/**
 * Champ de saisie de texte réutilisable
 * Supporte les icônes et différents types
 */
export function TextInput({
  id,
  label,
  placeholder,
  register,
  error,
  icon: Icon,
  type = 'text',
  autoComplete
}: TextInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          {...register}
          type={type}
          id={id}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 bg-slate-800 border ${
            error ? 'border-red-500' : 'border-slate-700'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent text-white placeholder-gray-500`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
