import { cn } from '@/lib/utils';

interface FormErrorProps {
  /** Message d'erreur à afficher */
  message?: string;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant d'erreur de formulaire réutilisable
 * Affiche un message d'erreur stylisé sous les champs de formulaire
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className={cn('mt-1 text-sm text-red-400', className)}>
      {message}
    </p>
  );
}
