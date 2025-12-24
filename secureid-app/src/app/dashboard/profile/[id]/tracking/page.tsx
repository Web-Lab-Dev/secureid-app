import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GpsSimulationCard } from '@/components/dashboard/GpsSimulationCard';

/**
 * PHASE 15 - PAGE TRACKING GPS (SERVER COMPONENT)
 *
 * Page dédiée pour afficher le tracking GPS simulé
 * - Header avec bouton retour
 * - Affichage du composant GpsSimulationCard
 * - Layout sombre immersif
 *
 * Route: /dashboard/profile/[id]/tracking
 * Protection: AuthGuard dans dashboard/layout.tsx
 */

interface TrackingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href={`/dashboard/profile/${id}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Localisation Temps Réel
            </h1>
            <p className="mt-1 text-slate-400">
              Suivez la position de votre enfant en direct
            </p>
          </div>
        </div>

        {/* Composant GPS Simulé */}
        <GpsSimulationCard />

        {/* Info supplémentaire */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-white">
            Comment ça marche ?
          </h3>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange/20 text-xs font-bold text-brand-orange">
                1
              </span>
              <span>
                Le bracelet envoie sa position GPS toutes les 5 minutes via réseau cellulaire intégré
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange/20 text-xs font-bold text-brand-orange">
                2
              </span>
              <span>
                Définissez des zones de sécurité (maison, école) et recevez des alertes en cas de sortie
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange/20 text-xs font-bold text-brand-orange">
                3
              </span>
              <span>
                Consultez l&apos;historique des déplacements sur 30 jours pour comprendre les habitudes
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
