import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  /** Centre le contenu verticalement et horizontalement */
  centered?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Conteneur de page full-screen avec fond noir et texte blanc
 * Utilisé pour toutes les pages de l'application pour une cohérence visuelle
 */
export function PageContainer({
  children,
  centered = true,
  className
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-brand-black text-white p-4",
        centered && "flex items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}
