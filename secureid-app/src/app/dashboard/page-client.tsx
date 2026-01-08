'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { Plus, Loader2, Users, MessageCircle, Globe, Bell, BellOff } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { EditProfileDialog } from '@/components/dashboard/EditProfileDialog';
import { MedicalDocsDialog } from '@/components/dashboard/MedicalDocsDialog';
import { SchoolDialog } from '@/components/dashboard/SchoolDialog';
import { ScanHistoryDialog } from '@/components/dashboard/ScanHistoryDialog';
import { EmptyState } from '@/components/ui/empty-state';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
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
  const {} = useAuthContext();
  const router = useRouter();
  const { profiles, loading, refetch } = useProfiles();
  const { hasPermission, requestPermission, loading: notifLoading } = useNotifications();
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

        // Charger chaque bracelet individuellement avec getDoc
        // Plus fiable que where('id', 'in') car utilise directement l'ID du document Firestore
        await Promise.all(
          braceletIds.map(async (braceletId) => {
            try {
              const braceletRef = doc(db, 'bracelets', braceletId);
              const braceletSnap = await getDoc(braceletRef);

              if (braceletSnap.exists()) {
                const data = {
                  id: braceletSnap.id,
                  ...braceletSnap.data(),
                } as BraceletDocument;
                braceletsMap[braceletId] = data;
              } else {
                logger.warn('Bracelet not found', { braceletId });
              }
            } catch (err) {
              logger.warn('Failed to load bracelet', { braceletId, error: err });
            }
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

  const handleAddChild = () => {
    logger.info('Navigating to scan page');
    router.push('/scan');
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
        {/* Notification Banner */}
        {!notifLoading && !hasPermission && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <BellOff className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white">Activez les notifications</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Recevez des alertes instantanées quand votre bracelet est scanné, même si votre téléphone est en veille.
                </p>
                <button
                  onClick={requestPermission}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-amber-400"
                >
                  <Bell className="h-4 w-4" />
                  Activer les notifications
                </button>
              </div>
            </div>
          </div>
        )}

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
          onClick={handleAddChild}
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
              onClick={handleAddChild}
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

      {/* Service Client Section */}
      <div className="mt-12 border-t border-slate-800 pt-8">
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-6 text-center text-lg font-semibold text-white">
            Besoin d&apos;aide ?
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* WhatsApp Contact */}
            <a
              href="https://wa.me/22677040492"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-green-500 hover:bg-slate-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 group-hover:bg-green-500/20">
                <MessageCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Service Client WhatsApp</p>
                <p className="text-sm text-slate-400">+226 77 04 04 92</p>
              </div>
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>

            {/* Site Web / Landing Page */}
            <a
              href="/"
              className="group flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-brand-orange hover:bg-slate-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10 group-hover:bg-brand-orange/20">
                <Globe className="h-6 w-6 text-brand-orange" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Guide & Documentation</p>
                <p className="text-sm text-slate-400">Comprendre comment ça marche</p>
              </div>
              <svg
                className="h-5 w-5 text-brand-orange"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
        </div>
      </div>
    </>
  );
}
