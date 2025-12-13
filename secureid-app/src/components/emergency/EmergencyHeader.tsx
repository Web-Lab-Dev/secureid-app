'use client';

import { Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@/lib/config';

/**
 * PHASE 5 - EMERGENCY HEADER
 *
 * En-tête de la page secouriste avec statut sécurité
 * - Logo SecureID
 * - Badge "SÉCURISÉ" (vert) ou "ALERTE MÉDICALE" (rouge clignotant)
 */

interface EmergencyHeaderProps {
  /** Afficher badge d'alerte si allergies/conditions critiques */
  hasAlert: boolean;
}

export function EmergencyHeader({ hasAlert }: EmergencyHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-brand-black/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-2xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-brand-orange" />
            <span className="text-xl font-bold text-white">{APP_CONFIG.name}</span>
          </div>

          {/* Badge Statut */}
          {hasAlert ? (
            <Badge
              variant="destructive"
              className="animate-pulse-glow gap-1 px-3 py-1 text-xs font-bold uppercase"
            >
              <AlertTriangle className="h-3 w-3" />
              Alerte Médicale
            </Badge>
          ) : (
            <Badge variant="default" className="gap-1 px-3 py-1 text-xs font-bold uppercase">
              <Shield className="h-3 w-3" />
              Sécurisé
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}
