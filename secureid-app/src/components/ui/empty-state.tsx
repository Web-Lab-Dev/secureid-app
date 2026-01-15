import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {/* Illustration avec animation */}
      <div className="relative mb-6">
        {/* Cercle animé en arrière-plan */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-brand-orange/20 to-trust-blue/20 animate-pulse" />
        </div>

        {/* Icône principale avec effet warm-glow */}
        <div className="relative z-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-lg border border-slate-700/50 animate-warm-glow">
          <Icon className="h-16 w-16 text-brand-orange" />
        </div>

        {/* Points décoratifs */}
        <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-trust-blue animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>

      {/* Texte avec meilleur contraste */}
      <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
      <p className="mb-8 max-w-md text-base text-slate-300 leading-relaxed">{description}</p>

      {/* Action avec animation */}
      {action && (
        <div className="mt-2 animate-celebration">
          {action}
        </div>
      )}

      {/* Séparateur décoratif */}
      <div className="mt-8 flex items-center gap-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-700" />
        <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-700" />
      </div>
    </div>
  );
}
