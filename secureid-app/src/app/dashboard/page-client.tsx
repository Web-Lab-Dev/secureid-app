'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import Link from 'next/link';
import { Plus, Loader2, Users } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuthContext } from '@/contexts/AuthContext';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { EditProfileDialog } from '@/components/dashboard/EditProfileDialog';
import { MedicalDocsDialog } from '@/components/dashboard/MedicalDocsDialog';
import { SchoolDialog } from '@/components/dashboard/SchoolDialog';
import { ScanHistoryDialog } from '@/components/dashboard/ScanHistoryDialog';
import { EmptyState } from '@/components/ui/empty-state';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BraceletDocument } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';

/**
 * PHASE 9 - DASHBOARD CLIENT COMPONENT (Refactored)
 *
 * Affiche la grille des profils enfants avec leurs bracelets
 * - 3 dialogs modaux pour gérer profil, dossier médical, et école
 * - Meilleure organisation de l'information
 * - UX améliorée avec dialogs au lieu de navigation
 */

export function DashboardPageClient() {
  const { user } = useAuthContext();
  const { profiles, loading, refetch } = useProfiles();
  const [bracelets, setBracelets] = useState<Record<string, BraceletDocument>>({});
  const [loadingBracelets, setLoadingBracelets] = useState(true);

  // Dialog states
  const [editProfileDialog, setEditProfileDialog] = useState<{
    isOpen: boolean;
    profile: ProfileDocument | null;
  }>({ isOpen: false, profile: null });

  const [medicalDocsDialog, setMedicalDocsDialog] = useState<{
    isOpen: boolean;
    profile: ProfileDocument | null;
  }>({ isOpen: false, profile: null });

  const [schoolDialog, setSchoolDialog] = useState<{
    isOpen: boolean;
    profile: ProfileDocument | null;
  }>({ isOpen: false, profile: null });

  const [scanHistoryDialog, setScanHistoryDialog] = useState<{
    isOpen: boolean;
    profile: ProfileDocument | null;
  }>({ isOpen: false, profile: null });

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

        const braceletsMap: Record<string, BraceletDocument> = {};

        // FIX P1: Firestore 'in' query limitée à 10 items max
        // Diviser en batches de 10 pour supporter 11+ profils
        const BATCH_SIZE = 10;
        const batches = [];

        for (let i = 0; i < braceletIds.length; i += BATCH_SIZE) {
          batches.push(braceletIds.slice(i, i + BATCH_SIZE));
        }

        // Exécuter toutes les queries en parallèle
        await Promise.all(
          batches.map(async (batch) => {
            const braceletsQuery = query(
              collection(db, 'bracelets'),
              where('id', 'in', batch)
            );

            const braceletsSnap = await getDocs(braceletsQuery);

            braceletsSnap.forEach((doc) => {
              const data = doc.data() as BraceletDocument;
              braceletsMap[data.id] = data;
            });
          })
        );

        setBracelets(braceletsMap);
      } catch (error) {
        logger.error('Error loading bracelets', { error, profileCount: profiles.length });
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

  // Dialog handlers
  const handleEditProfile = (profile: ProfileDocument) => {
    setEditProfileDialog({ isOpen: true, profile });
  };

  const handleManageMedical = (profile: ProfileDocument) => {
    setMedicalDocsDialog({ isOpen: true, profile });
  };

  const handleManageSchool = (profile: ProfileDocument) => {
    setSchoolDialog({ isOpen: true, profile });
  };

  const handleViewScans = (profile: ProfileDocument) => {
    setScanHistoryDialog({ isOpen: true, profile });
  };

  const handleProfileUpdate = () => {
    // Rafraîchir les profils après mise à jour
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
    <>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Ma Famille</h1>
          <p className="mt-2 text-slate-400">
            {profiles.length === 0
              ? 'Aucun enfant protégé'
              : `${profiles.length} enfant${profiles.length > 1 ? 's' : ''} protégé${profiles.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Bouton Ajouter */}
        <button
          onClick={() => alert('📱 Scannez le QR code sur votre nouveau bracelet SecureID pour continuer l\'activation.\n\nSi vous n\'avez pas encore de bracelet, commandez-en un sur notre site.')}
          className="flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-orange/90"
        >
          <Plus className="h-5 w-5" />
          Protéger un autre enfant
        </button>
      </div>

      {/* Grille de Profils ou Empty State */}
      {profiles.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun enfant enregistré"
          description="Commencez par scanner un bracelet QR code pour créer le premier profil de votre enfant."
          action={
            <button
              onClick={() => alert('📱 Scannez le QR code sur votre bracelet SecureID avec l\'appareil photo de votre téléphone.\n\nSi vous n\'avez pas encore de bracelet, commandez-en un sur notre site.')}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-orange/90"
            >
              <Plus className="h-5 w-5" />
              Scanner un Bracelet
            </button>
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
              onEditProfile={() => handleEditProfile(profile)}
              onManageMedical={() => handleManageMedical(profile)}
              onManageSchool={() => handleManageSchool(profile)}
              onViewScans={() => handleViewScans(profile)}
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

      {/* PWA Install Banner (PHASE 7) */}
      <InstallBanner />

      {/* Dialogs Modaux */}
      {editProfileDialog.profile && (
        <EditProfileDialog
          isOpen={editProfileDialog.isOpen}
          onClose={() => setEditProfileDialog({ isOpen: false, profile: null })}
          profile={editProfileDialog.profile}
          onUpdate={handleProfileUpdate}
        />
      )}

      {medicalDocsDialog.profile && (
        <MedicalDocsDialog
          isOpen={medicalDocsDialog.isOpen}
          onClose={() => setMedicalDocsDialog({ isOpen: false, profile: null })}
          profile={medicalDocsDialog.profile}
        />
      )}

      {schoolDialog.profile && (
        <SchoolDialog
          isOpen={schoolDialog.isOpen}
          onClose={() => setSchoolDialog({ isOpen: false, profile: null })}
          profile={schoolDialog.profile}
        />
      )}

      {scanHistoryDialog.profile && (
        <ScanHistoryDialog
          isOpen={scanHistoryDialog.isOpen}
          onClose={() => setScanHistoryDialog({ isOpen: false, profile: null })}
          profile={scanHistoryDialog.profile}
        />
      )}
    </>
  );
}
