'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Users } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuthContext } from '@/contexts/AuthContext';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { EmptyState } from '@/components/ui/empty-state';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BraceletDocument } from '@/types/bracelet';

/**
 * PHASE 4 - DASHBOARD CLIENT COMPONENT
 *
 * Affiche la grille des profils enfants avec leurs bracelets
 * Permet de déclarer un bracelet perdu et d'ajouter de nouveaux enfants
 */

export function DashboardPageClient() {
  const { user } = useAuthContext();
  const { profiles, loading, refetch } = useProfiles();
  const [bracelets, setBracelets] = useState<Record<string, BraceletDocument>>({});
  const [loadingBracelets, setLoadingBracelets] = useState(true);

  // Charger les bracelets liés aux profils
  useEffect(() => {
    const loadBracelets = async () => {
      if (!profiles || profiles.length === 0) {
        setLoadingBracelets(false);
        return;
      }

      try {
        // Récupérer tous les IDs de bracelets liés
        const braceletIds = profiles
          .map((p) => p.currentBraceletId)
          .filter((id): id is string => id !== null);

        if (braceletIds.length === 0) {
          setLoadingBracelets(false);
          return;
        }

        // Query Firestore pour récupérer les bracelets
        const braceletsQuery = query(
          collection(db, 'bracelets'),
          where('id', 'in', braceletIds)
        );

        const braceletsSnap = await getDocs(braceletsQuery);
        const braceletsMap: Record<string, BraceletDocument> = {};

        braceletsSnap.forEach((doc) => {
          const data = doc.data() as BraceletDocument;
          braceletsMap[data.id] = data;
        });

        setBracelets(braceletsMap);
      } catch (error) {
        console.error('Error loading bracelets:', error);
      } finally {
        setLoadingBracelets(false);
      }
    };

    loadBracelets();
  }, [profiles]);

  const handleStatusChange = () => {
    // Rafraîchir les profils et bracelets
    refetch();
  };

  if (loading || loadingBracelets) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-orange" />
          <p className="mt-4 text-slate-400">Chargement de vos profils...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mes Enfants</h1>
          <p className="mt-2 text-slate-400">
            {profiles.length === 0
              ? 'Aucun profil enregistré'
              : `${profiles.length} profil${profiles.length > 1 ? 's' : ''} enregistré${profiles.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Bouton Ajouter */}
        <Link
          href="/activate"
          className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-orange/90"
        >
          <Plus className="h-5 w-5" />
          Ajouter une Unité
        </Link>
      </div>

      {/* Grille de Profils ou Empty State */}
      {profiles.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun enfant enregistré"
          description="Commencez par scanner un bracelet QR code pour créer le premier profil de votre enfant."
          action={
            <Link
              href="/activate"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-orange/90"
            >
              <Plus className="h-5 w-5" />
              Scanner un Bracelet
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              bracelet={profile.currentBraceletId ? bracelets[profile.currentBraceletId] || null : null}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Stats Summary (optionnel) */}
      {profiles.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-900 p-6 text-center">
            <p className="text-2xl font-bold text-white">{profiles.length}</p>
            <p className="text-sm text-slate-400">Profils Actifs</p>
          </div>
          <div className="rounded-lg bg-slate-900 p-6 text-center">
            <p className="text-2xl font-bold text-green-500">
              {Object.values(bracelets).filter((b) => b.status === 'ACTIVE').length}
            </p>
            <p className="text-sm text-slate-400">Bracelets Actifs</p>
          </div>
          <div className="rounded-lg bg-slate-900 p-6 text-center">
            <p className="text-2xl font-bold text-orange-500">
              {Object.values(bracelets).filter((b) => b.status === 'LOST').length}
            </p>
            <p className="text-sm text-slate-400">Bracelets Perdus</p>
          </div>
        </div>
      )}
    </div>
  );
}
