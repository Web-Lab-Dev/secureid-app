import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'primary' | 'ghost' | 'success' | 'warning' | 'error';

interface CardProps {
  children: ReactNode;
  /** Variante visuelle de la carte */
  variant?: CardVariant;
  /** Classes CSS additionnelles */
  className?: string;
  /** Padding personnalisé (défaut: p-6) */
  padding?: string;
}

/**
 * Composant de carte réutilisable avec différentes variantes
 * Utilisé pour regrouper du contenu avec un fond et une bordure
 */
export function Card({
  children,
  variant = 'default',
  className,
  padding = 'p-6'
}: CardProps) {
  const variants: Record<CardVariant, string> = {
    default: "bg-slate-900 border-slate-800",
    primary: "bg-slate-900 border-brand-orange border-2",
    ghost: "bg-slate-900/50 border-slate-700",
    success: "bg-tactical-green/10 border-tactical-green/30",
    warning: "bg-brand-orange/10 border-brand-orange/30",
    error: "bg-red-900/20 border-red-500"
  };

  return (
    <div
      className={cn(
        "rounded-lg border",
        variants[variant],
        padding,
        className
      )}
    >
      {children}
    </div>
  );
}
