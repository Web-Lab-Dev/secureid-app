'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MedicalFormEdit } from '@/components/dashboard/MedicalFormEdit';
import { ConfidentialZone } from '@/components/dashboard/ConfidentialZone';
import { SchoolSection } from '@/components/dashboard/SchoolSection';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 4B - PAGE DÉTAIL PROFIL (CLIENT COMPONENT)
 *
 * Gestion complète du dossier médical enfant
 * - Onglet 1: Infos Publiques (modifier groupe sanguin, allergies, contacts)
 * - Onglet 2: Zone Confidentielle (documents PDF, PIN médecin)
 */

interface ProfileDetailClientProps {
  profileId: string;
}

export function ProfileDetailClient({ profileId }: ProfileDetailClientProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le profil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const profileRef = doc(db, 'profiles', profileId);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          setError('Profil introuvable');
          return;
        }

        const profileData = profileSnap.data() as ProfileDocument;

        // Vérifier les permissions
        if (profileData.parentId !== user.uid) {
          setError('Vous n\'êtes pas autorisé à voir ce profil');
          return;
        }

        setProfile(profileData);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId, user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-orange" />
          <p className="mt-4 text-slate-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Erreur</h2>
          <p className="mb-6 text-slate-400">{error || 'Profil introuvable'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-orange/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au Dashboard
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{profile.fullName}</h1>
            <p className="mt-2 text-slate-400">
              Dossier médical et documents confidentiels
            </p>
          </div>
          <div className="rounded-lg bg-slate-900 px-4 py-2">
            <p className="text-xs text-slate-400">ID Profil</p>
            <p className="font-mono text-sm text-white">{profile.id}</p>
          </div>
        </div>
      </div>

      {/* Dossier Médical - Tabs: Infos Publiques | Zone Confidentielle */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Dossier Médical</h2>
          <p className="text-sm text-slate-400">
            Informations de santé et documents confidentiels
          </p>
        </div>

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 sm:w-auto sm:flex">
            <TabsTrigger value="public">Infos Publiques</TabsTrigger>
            <TabsTrigger value="confidential">Zone Confidentielle</TabsTrigger>
          </TabsList>

          {/* Onglet 1: Infos Publiques */}
          <TabsContent value="public">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Informations Médicales</h3>
                <p className="text-sm text-slate-400">
                  Ces informations sont visibles par les secouristes lors du scan du bracelet
                </p>
              </div>

              <MedicalFormEdit profile={profile} onUpdate={() => router.refresh()} />
            </div>
          </TabsContent>

          {/* Onglet 2: Zone Confidentielle */}
          <TabsContent value="confidential">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Documents Confidentiels</h3>
                <p className="text-sm text-slate-400">
                  Documents protégés par code PIN médecin (ordonnances, radios, carnet de vaccination)
                </p>
              </div>

              <ConfidentialZone profile={profile} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Section École & Sorties - En dehors du dossier médical */}
      <div className="rounded-lg border border-indigo-800 bg-indigo-950/30 p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">École & Sorties 🎓</h2>
          <p className="text-sm text-slate-400">
            Gestion des personnes autorisées à récupérer l'enfant à l'école
          </p>
        </div>

        <SchoolSection profile={profile} />
      </div>
    </div>
  );
}
