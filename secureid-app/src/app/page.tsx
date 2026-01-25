'use client';

import { Shield } from 'lucide-react';
import { useState, useEffect, lazy, Suspense } from 'react';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import TrustBar from '@/components/landing/TrustBar';

// Lazy loading des sections non-critiques pour optimiser le bundle initial
const ProblemSolutionSection = lazy(() => import('@/components/landing/ProblemSolutionSection'));
const DashboardCarouselSection = lazy(() => import('@/components/landing/DashboardCarouselSection'));
const ShieldSection = lazy(() => import('@/components/landing/ShieldSection'));
const FeaturesSection = lazy(() => import('@/components/landing/FeaturesSection'));
const IASection = lazy(() => import('@/components/landing/IASection'));
const ParentTestimonialsTikTokSection = lazy(() => import('@/components/landing/ParentTestimonialsTikTokSection'));
const GeofencingSection = lazy(() => import('@/components/landing/GeofencingSection'));
const SecoursiteSection = lazy(() => import('@/components/landing/SecoursiteSection'));
const ProductDemoSection = lazy(() => import('@/components/landing/ProductDemoSection'));
const TestimonialsCarousel = lazy(() => import('@/components/landing/TestimonialsCarousel'));
const CTASection = lazy(() => import('@/components/landing/CTASection'));
const PartnershipSection = lazy(() => import('@/components/landing/PartnershipSection'));
const PartnershipModal = lazy(() => import('@/components/landing/PartnershipModal'));
const Footer = lazy(() => import('@/components/landing/Footer'));
const StickyBar = lazy(() => import('@/components/landing/StickyBar'));

/**
 * PHASE 10 - LANDING PAGE ÉMOTIONNELLE "WARM & SAFE"
 *
 * Direction artistique : Terre & Solaire
 * Copywriting : Parental, rassurant, sans jargon technique
 * Animations : Framer Motion fluides, scrollytelling
 *
 * SEO: Metadata définis dans layout.tsx parent
 */

export default function LandingPage() {
  // État modal partenaire
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Récupérer les paramètres URL pour scan INACTIVE - FIX HYDRATION MISMATCH
  // Utiliser useState au lieu de useMemo pour éviter différence serveur/client
  const [braceletParams, setBraceletParams] = useState<{ id?: string; token?: string; welcome?: boolean }>({});

  useEffect(() => {
    // Marquer comme monté pour éviter hydration mismatch du bandeau
    setMounted(true);

    // Lire les paramètres URL côté client uniquement après hydration
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const token = params.get('token');
    const welcome = params.get('welcome') === 'true';

    if (id && token) {
      setBraceletParams({ id, token, welcome });
    }
  }, []);

  return (
    <>
      <PartnershipModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} />
    <div className="overflow-x-hidden bg-[#FAFAF9]">
      <Header braceletParams={braceletParams} />

      {/* Bandeau confirmation bracelet détecté (après scan QR) */}
      {/* Afficher uniquement après hydration pour éviter mismatch */}
      {mounted && braceletParams?.welcome && braceletParams?.id && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-green-900/95 backdrop-blur-sm border-b border-green-500/30 py-3 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 justify-center">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="text-center sm:text-left">
                <p className="text-green-400 font-semibold text-sm sm:text-base">
                  Bracelet détecté : <span className="font-mono">{braceletParams.id}</span>
                </p>
                <p className="text-gray-300 text-xs sm:text-sm">
                  Cliquez sur "Activer sa protection" ci-dessous pour commencer
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16"> {/* Padding pour compenser le header fixe */}
        <HeroSection braceletParams={braceletParams} />
        <TrustBar />

      {/* Lazy loading des sections non-critiques avec Suspense - Fallbacks optimisés pour CLS */}
      <Suspense fallback={<div className="min-h-96 w-full bg-white" />}>
        <ProblemSolutionSection />

        {/* PHASE 13 - SHOWCASE 1: DASHBOARD PARENT (Carrousel Auto-Défilant) */}
        <DashboardCarouselSection />

        <ShieldSection />
        <FeaturesSection />

        {/* DÉMO PRODUIT - Présenté AVANT les fonctionnalités détaillées pour cohérence narrative */}
        <ProductDemoSection />

        <IASection />
      </Suspense>

      {/* NOUVELLE SECTION: Témoignages TikTok Parents - Choc émotionnel */}
      <Suspense fallback={<div className="min-h-96 w-full bg-slate-900" />}>
        <ParentTestimonialsTikTokSection />
      </Suspense>

      {/* NOUVELLE SECTION: Geofencing GPS - Solution proactive après le choc émotionnel */}
      <Suspense fallback={<div className="min-h-96 w-full bg-gradient-to-br from-indigo-50 to-blue-50" />}>
        <GeofencingSection />
      </Suspense>

      {/* Interface Secouriste - Les deux portails */}
      <Suspense fallback={<div className="min-h-96 w-full bg-slate-900" />}>
        <SecoursiteSection />
      </Suspense>

      {/* SECTION 4: TÉMOIGNAGES - PHASE 12 CARROUSEL */}
      <Suspense fallback={<div className="min-h-96 w-full bg-white" />}>
        <TestimonialsCarousel />
      </Suspense>

      <Suspense fallback={<div className="min-h-96 w-full bg-black" />}>
        <CTASection />
      </Suspense>

      <Suspense fallback={<div className="min-h-64 w-full bg-white" />}>
        <PartnershipSection onOpenModal={() => setIsPartnerModalOpen(true)} />
      </Suspense>

      <Suspense fallback={<div className="min-h-64 w-full bg-[#FAFAF9]" />}>
        <Footer />
      </Suspense>

      <StickyBar braceletParams={braceletParams} />
      </div> {/* Fermeture du div pt-16 */}
    </div>
    </>
  );
}
