'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { OrderModal } from './OrderModal';
import { Button } from '@/components/ui/button';
import { getActivateUrl, type BraceletParams } from '@/lib/url-helpers';

interface HeroSectionProps {
  braceletParams?: BraceletParams;
}

export default function HeroSection({ braceletParams }: HeroSectionProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <>
      {/* SECTION 1: HERO ÉMOTIONNEL */}
      <section className="relative h-screen overflow-hidden">
        {/* Image de fond FIXE (parallax) */}
        <div className="fixed inset-0 h-screen w-full">
          <Image
            src="/landing/hero-mother-child.webp"
            alt="Mère tenant son enfant dans ses bras"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={90}
          />
          {/* Overlay gradient pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
        </div>

        {/* Titre optimisé pour LCP - Animations simplifiées */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="font-playfair text-4xl font-bold leading-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl animate-in fade-in duration-500">
            <span className="block">
              Parce qu'il est
            </span>
            <span className="block bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              votre monde.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl font-outfit text-lg text-white/95 drop-shadow-lg sm:text-xl animate-in fade-in duration-500 delay-150">
            Un lien invisible qui veille sur lui quand vos yeux ne le peuvent pas.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-4 animate-in fade-in duration-500 delay-300">
            {/* Bouton Principal - Activer */}
            <Button variant="gradient" size="lg" rounded="full" asChild>
              <Link href={getActivateUrl(braceletParams)}>
                <Shield className="h-5 w-5" aria-hidden="true" />
                Activer sa protection
              </Link>
            </Button>

            {/* Bouton Secondaire - Commander */}
            <Button variant="outline" size="lg" rounded="full" onClick={() => setIsOrderModalOpen(true)}>
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              Commander un bracelet
            </Button>
          </div>
        </div>

        {/* Scroll indicator - Lazy loaded avec motion */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-700"
          aria-label="Faites défiler vers le bas pour découvrir SecureID"
          role="img"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-8 w-5 rounded-full border-2 border-orange-400/50"
            aria-hidden="true"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mx-auto mt-1 h-2 w-1 rounded-full bg-orange-400"
            />
          </motion.div>
        </div>
      </section>

      {/* Transition SVG Wave */}
      <div className="relative z-10 -mt-1">
        <svg
          viewBox="0 0 1440 120"
          className="w-full text-[#FAFAF9]"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>

      {/* Modal de Commande */}
      <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
    </>
  );
}
