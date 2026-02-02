'use client';

import { lazy, Suspense } from 'react';
import Header from '@/components/landing/Header';

// Eagerly load hero for LCP
import HowItWorksHero from '@/components/how-it-works/HowItWorksHero';

// Lazy load other sections
const TimelineSection = lazy(() => import('@/components/how-it-works/TimelineSection'));
const SimulationVideos = lazy(() => import('@/components/how-it-works/SimulationVideos'));
const FlowDiagram = lazy(() => import('@/components/how-it-works/FlowDiagram'));
const HowItWorksCTA = lazy(() => import('@/components/how-it-works/HowItWorksCTA'));
const Footer = lazy(() => import('@/components/landing/Footer'));

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <HowItWorksHero />

        {/* Timeline Section - Le Parcours */}
        <Suspense fallback={<div className="min-h-96 w-full bg-white" />}>
          <TimelineSection />
        </Suspense>

        {/* Simulation Videos Section */}
        <Suspense fallback={<div className="min-h-96 w-full bg-gradient-to-b from-white to-gray-50" />}>
          <SimulationVideos />
        </Suspense>

        {/* Flow Diagram Section */}
        <Suspense fallback={<div className="min-h-96 w-full bg-white" />}>
          <FlowDiagram />
        </Suspense>

        {/* CTA Section */}
        <Suspense fallback={<div className="min-h-64 w-full bg-gray-900" />}>
          <HowItWorksCTA />
        </Suspense>

        {/* Footer */}
        <Suspense fallback={<div className="min-h-64 w-full bg-[#FAFAF9]" />}>
          <Footer />
        </Suspense>
      </main>
    </div>
  );
}
