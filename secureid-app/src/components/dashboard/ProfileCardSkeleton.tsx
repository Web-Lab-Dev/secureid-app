'use client';

import { Card } from '@/components/ui/Card';

/**
 * PHASE 11 - PROFILE CARD SKELETON
 *
 * Composant de chargement pour ProfileCard
 * Améliore l'expérience utilisateur pendant le chargement des données
 */

export function ProfileCardSkeleton() {
  return (
    <Card variant="default" className="animate-pulse">
      <div className="p-6">
        {/* Header avec Photo skeleton */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Photo skeleton */}
            <div className="h-28 w-28 rounded-full bg-slate-800/50 border-2 border-slate-700" />

            {/* Nom skeleton */}
            <div>
              <div className="h-6 w-32 bg-slate-800/50 rounded mb-2" />
              <div className="h-4 w-24 bg-slate-800/50 rounded" />
            </div>
          </div>

          {/* Badge skeleton */}
          <div className="h-6 w-20 bg-slate-800/50 rounded-full" />
        </div>

        {/* Infos skeleton */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-800/50 rounded" />
            <div className="h-4 w-40 bg-slate-800/50 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-800/50 rounded" />
            <div className="h-4 w-32 bg-slate-800/50 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-800/50 rounded" />
            <div className="h-4 w-28 bg-slate-800/50 rounded" />
          </div>
        </div>

        {/* Toggle skeleton */}
        <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-800/30 p-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-800/50 rounded" />
            <div className="h-4 w-28 bg-slate-800/50 rounded" />
          </div>
          <div className="h-6 w-11 bg-slate-800/50 rounded-full" />
        </div>

        {/* Actions skeleton */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="h-10 bg-slate-800/50 rounded-lg" />
          <div className="h-10 bg-slate-800/50 rounded-lg" />
          <div className="h-10 bg-slate-800/50 rounded-lg" />
          <div className="h-10 bg-slate-800/50 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}
