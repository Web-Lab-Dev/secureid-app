'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, ShoppingCart } from 'lucide-react';
import { useRef } from 'react';

interface HeroSectionProps {
  braceletParams?: { id?: string; token?: string; welcome?: boolean };
}

export default function HeroSection({ braceletParams }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  // Construire l'URL avec les paramètres du bracelet si disponibles
  const getActivateUrl = () => {
    if (braceletParams?.id && braceletParams?.token) {
      return `/activate?id=${braceletParams.id}&token=${braceletParams.token}`;
    }
    return '/login';
  };

  return (
    <>
      {/* SECTION 1: HERO ÉMOTIONNEL */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
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

        {/* Titre animé mot par mot */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.h1
            className="font-playfair text-4xl font-bold leading-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="block"
            >
              Parce qu'il est
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="block bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent"
            >
              votre monde.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-6 max-w-2xl font-outfit text-lg text-white/95 drop-shadow-lg sm:text-xl"
          >
            Un lien invisible qui veille sur lui quand vos yeux ne le peuvent pas.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            {/* Bouton Principal - Activer */}
            <Link
              href={getActivateUrl()}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-4 font-outfit text-base font-semibold text-white shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/50"
            >
              <Shield className="h-5 w-5" aria-hidden="true" />
              Activer sa protection
            </Link>

            {/* Bouton Secondaire - Commander */}
            <Link
              href="#commander"
              className="inline-flex items-center gap-2 rounded-full border-2 border-orange-500 bg-transparent px-8 py-4 font-outfit text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-orange-500/10 hover:scale-105"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              Commander un bracelet
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
        </motion.div>
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
    </>
  );
}
