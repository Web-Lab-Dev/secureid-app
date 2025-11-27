import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  error?: string | null;
  footer?: ReactNode;
}

/**
 * Conteneur de formulaire réutilisable
 * Gère le titre, sous-titre, erreurs et footer
 */
export function FormContainer({
  title,
  subtitle,
  children,
  onSubmit,
  error,
  footer
}: FormContainerProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {subtitle && (
        <p className="text-gray-400 mb-6">{subtitle}</p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>

      {footer && (
        <div className="mt-6">
          {footer}
        </div>
      )}
    </div>
  );
}
