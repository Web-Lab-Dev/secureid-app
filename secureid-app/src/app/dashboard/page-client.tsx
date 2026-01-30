'use client';

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { Plus, Loader2, Users, MessageCircle, Globe, Bell, BellOff, Heart } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { ProfileCardSkeleton } from '@/components/dashboard/ProfileCardSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { getBraceletsByProfileIds } from '@/actions/bracelet-actions';
import type { BraceletDocument } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';

// PHASE 11 - Lazy Loading des Dialogs (optimisation bundle)
const EditProfileDialog = lazy(() => import('@/components/dashboard/EditProfileDialog').then(m => ({ default: m.EditProfileDialog })));
const MedicalDocsDialog = lazy(() => import('@/components/dashboard/MedicalDocsDialog').then(m => ({ default: m.MedicalDocsDialog })));
const SchoolDialog = lazy(() => import('@/components/dashboard/SchoolDialog').then(m => ({ default: m.SchoolDialog })));
const ScanHistoryDialog = lazy(() => import('@/components/dashboard/ScanHistoryDialog').then(m => ({ default: m.ScanHistoryDialog })));

/**
 * Délai avant rechargement des bracelets après changement de statut.
 * Nécessaire pour laisser Firestore propager les modifications.
 * Valeur calibrée pour couvrir la latence Firestore typique (100-200ms).
 */
const FIRESTORE_PROPAGATION_DELAY_MS = 300;

/**
 * PHASE 9 - DASHBOARD CLIENT COMPONENT (Refactored)
 * PHASE 11 - Lazy loading dialogs + optimisations bundle
 *
 * Affiche la grille des profils enfants avec leurs bracelets
 * - 4 dialogs modaux lazy-loaded pour réduire bundle initial
 * - Meilleure organisation de l'information
 * - UX améliorée avec dialogs au lieu de navigation
 */

export function DashboardPageClient() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { profiles, loading, refetch } = useProfiles();
  const { hasPermission, requestPermission, loading: notifLoading } = useNotifications();
  const [bracelets, setBracelets] = useState<Record<string, BraceletDocument>>({});
  const [loadingBracelets, setLoadingBracelets] = useState(true);

  // ✅ FIX: Ref pour éviter les updates d'état après démontage (fuite mémoire)
  const isMountedRef = useRef(true);

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

  // ✅ FIX: Cleanup du ref au démontage
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fonction de chargement des bracelets - réutilisable
  const loadBracelets = useCallback(async (showLoading = false) => {
    if (!profiles || profiles.length === 0 || !user) {
      if (isMountedRef.current) setLoadingBracelets(false);
      return;
    }

    if (showLoading && isMountedRef.current) {
      setLoadingBracelets(true);
    }

    try {
      // Récupérer tous les IDs de profils
      const profileIds = profiles.map((p) => p.id).filter((id): id is string => !!id);

      if (profileIds.length === 0) {
        if (isMountedRef.current) setLoadingBracelets(false);
        return;
      }

      // ✅ SÉCURITÉ: Utilisation de Server Action (Admin SDK)
      // - Valide que tous les profils appartiennent au user
      // - Filtre automatiquement secretToken
      // - Pas d'exposition Client SDK
      const result = await getBraceletsByProfileIds({
        profileIds,
        userId: user.uid,
      });

      // ✅ FIX: Vérifier si toujours monté avant update d'état
      if (!isMountedRef.current) return;

      if (result.success && result.bracelets) {
        setBracelets(result.bracelets);
      } else {
        logger.warn('Failed to load bracelets', { error: result.error });
      }
    } catch (error) {
      logger.error('Error loading bracelets', { error, profileCount: profiles.length });
    } finally {
      if (isMountedRef.current) setLoadingBracelets(false);
    }
  }, [profiles, user]);

  // Charger les bracelets liés aux profils via Server Action sécurisée
  useEffect(() => {
    loadBracelets(true);
  }, [loadBracelets]);

  const handleStatusChange = useCallback(async () => {
    // ✅ FIX: Rafraîchir les profils de manière séquentielle
    // Note: refetch() de useProfiles peut être sync ou async selon l'implémentation
    await Promise.resolve(refetch());

    // ✅ FIX: Vérifier si toujours monté après refetch
    if (!isMountedRef.current) return;

    // Délai pour laisser Firestore propager les modifications
    await new Promise(resolve => setTimeout(resolve, FIRESTORE_PROPAGATION_DELAY_MS));

    // ✅ FIX: Vérifier si toujours monté après le délai
    if (!isMountedRef.current) return;

    await loadBracelets(false);
  }, [refetch, loadBracelets]);

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
      <div className="py-8">
        {/* Header skeleton - centré comme le vrai header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-slate-800/50 animate-pulse" />
          <div className="h-9 w-40 bg-slate-800/50 rounded animate-pulse mb-2" />
          <div className="h-5 w-56 bg-slate-800/50 rounded animate-pulse mb-6" />
          <div className="h-12 w-48 bg-slate-800/50 rounded-full animate-pulse" />
        </div>

        {/* Skeletons grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
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

        {/* Header - Design Émotionnel Minimaliste */}
        <div className="mb-10 text-center">
          {/* Icône coeur animée */}
          <div className="mb-4 inline-flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-soft-pink/30" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-soft-pink/20 to-soft-pink/5 ring-2 ring-soft-pink/30">
                <Heart className="h-8 w-8 text-soft-pink animate-heartbeat" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-3xl font-bold text-white font-playfair">
            Ma Famille
          </h1>

          {/* Sous-titre émotionnel */}
          <p className="mt-2 text-slate-400">
            {profiles.length === 0 ? (
              <span className="text-slate-500">Aucun enfant sous votre protection</span>
            ) : (
              <>
                <span className="text-soft-pink font-semibold">{profiles.length}</span>
                {' '}
                {profiles.length === 1 ? 'trésor' : 'trésors'} sous votre protection
              </>
            )}
          </p>

          {/* Bouton CTA avec effet glow */}
          <button
            onClick={handleAddChild}
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-dark px-6 py-3 font-semibold text-white shadow-lg shadow-brand-orange/25 transition-all hover:shadow-xl hover:shadow-brand-orange/30 hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            Protéger un enfant
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
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
        <div className="mt-12 grid gap-4 sm:grid-cols-3 stagger-children">
          <div className="rounded-lg bg-slate-900/80 p-6 text-center transition-all hover:bg-slate-900">
            <p className="text-2xl font-bold text-white">{profiles.length}</p>
            <p className="text-sm text-slate-400">Profils Actifs</p>
          </div>
          <div className="rounded-lg bg-slate-900/80 p-6 text-center transition-all hover:bg-slate-900">
            <p className="text-2xl font-bold text-green-500">
              {Object.values(bracelets).filter((b) => b.status === 'ACTIVE').length}
            </p>
            <p className="text-sm text-slate-400">Bracelets Actifs</p>
          </div>
          <div className="rounded-lg bg-slate-900/80 p-6 text-center transition-all hover:bg-slate-900">
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

      {/* Dialogs Modaux - Lazy Loaded avec Suspense */}
      {editProfileDialog.profile && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div>}>
          <EditProfileDialog
            isOpen={editProfileDialog.isOpen}
            onClose={() => setEditProfileDialog({ isOpen: false, profile: null })}
            profile={editProfileDialog.profile}
            onUpdate={handleProfileUpdate}
          />
        </Suspense>
      )}

      {medicalDocsDialog.profile && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div>}>
          <MedicalDocsDialog
            isOpen={medicalDocsDialog.isOpen}
            onClose={() => setMedicalDocsDialog({ isOpen: false, profile: null })}
            profile={medicalDocsDialog.profile}
          />
        </Suspense>
      )}

      {schoolDialog.profile && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div>}>
          <SchoolDialog
            isOpen={schoolDialog.isOpen}
            onClose={() => setSchoolDialog({ isOpen: false, profile: null })}
            profile={schoolDialog.profile}
          />
        </Suspense>
      )}

      {scanHistoryDialog.profile && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div>}>
          <ScanHistoryDialog
            isOpen={scanHistoryDialog.isOpen}
            onClose={() => setScanHistoryDialog({ isOpen: false, profile: null })}
            profile={scanHistoryDialog.profile}
          />
        </Suspense>
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
