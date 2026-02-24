'use client';

import { Shield, Zap, Droplet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Section Démo Produit "L'Armure Invisible"
 * Présente les caractéristiques physiques du bracelet
 */
export function ProductDemoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Lazy load: ne charge la vidéo que lorsqu'elle est visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative z-10 bg-stone-900 px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Titre */}
        <div className="mb-12 text-center">
          <h2 className="font-playfair text-4xl font-bold text-white sm:text-5xl">
            Conçu pour{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              la vraie vie.
            </span>
          </h2>
          <p className="mt-4 font-outfit text-lg text-stone-300 sm:text-xl">
            Robuste. Étanche. Confortable. Prêt pour toutes ses aventures.
          </p>
        </div>

        {/* Vidéo Démo - Lazy loaded - Taille limitée sur desktop */}
        <div className="relative mx-auto mb-16 aspect-video max-h-[70vh] w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl shadow-orange-500/20 bg-stone-800">
          <video
            ref={videoRef}
            autoPlay={isInView}
            muted
            loop
            playsInline
            preload="none"
            className="h-full w-full object-cover rounded-3xl"
          >
            {isInView && <source src="/landing/video-demo.mp4" type="video/mp4" />}
            Votre navigateur ne supporte pas la vidéo HTML5.
          </video>
        </div>

        {/* Grid Features */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Feature 1: Autonomie longue durée */}
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
              <Zap className="h-8 w-8 text-orange-400" strokeWidth={2} aria-hidden="true" />
            </div>
            <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
              Autonomie optimisée
            </h3>
            <p className="font-outfit text-stone-400">
              Une recharge rapide pour des jours de protection. Le QR reste actif même batterie vide.
            </p>
          </div>

          {/* Feature 2: Étanche */}
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
              <Droplet className="h-8 w-8 text-blue-400" strokeWidth={2} aria-hidden="true" />
            </div>
            <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
              100% Étanche
            </h3>
            <p className="font-outfit text-stone-400">
              Il résiste à la boue, à la pluie et aux récréations les plus mouvementées.
            </p>
          </div>

          {/* Feature 3: Hypoallergénique */}
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Shield className="h-8 w-8 text-emerald-400" strokeWidth={2} aria-hidden="true" />
            </div>
            <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
              Matériaux Hypoallergéniques
            </h3>
            <p className="font-outfit text-stone-400">
              Conçu avec des matériaux certifiés, doux pour la peau sensible des enfants.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDemoSection;
