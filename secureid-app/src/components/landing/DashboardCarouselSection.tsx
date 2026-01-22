'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { User, Radio, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Section Dashboard Carrousel
 * Présente l'application parent avec un carrousel d'écrans
 */
export function DashboardCarouselSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const dashboardSlides = useMemo(() => [
    {
      src: '/landing/showcase/dashboard/dashboard-home.jpg',
      alt: 'Accueil Dashboard - Vue d\'ensemble',
      title: 'Vue d\'ensemble',
      description: 'Tous vos enfants, en un coup d\'œil',
    },
    {
      src: '/landing/showcase/dashboard/dashboard-profile.jpg',
      alt: 'Profil Enfant - Données médicales',
      title: 'Profil complet',
      description: 'Allergies, médicaments, contacts d\'urgence',
    },
    {
      src: '/landing/showcase/dashboard/rescue-medical.jpg',
      alt: 'Vue Secouriste - Interface médicale',
      title: 'Vue Médecin',
      description: 'Accès immédiat aux données vitales',
    },
    {
      src: '/landing/showcase/dashboard/rescue-school.jpg',
      alt: 'Vue École - Gestion scolaire',
      title: 'Vue École',
      description: 'Vérification sécurisée à la sortie',
    },
    {
      src: '/landing/showcase/dashboard/dashboard-home (2).jpg',
      alt: 'Dashboard - Carte d\'identité enfant',
      title: 'Sa propre carte d\'identité',
      description: 'Il n\'est plus un inconnu. Chaque enfant a son identité numérique sécurisée.',
    },
  ], []);

  // Auto-scroll toutes les 4 secondes (désactivé si prefers-reduced-motion)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dashboardSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [dashboardSlides.length, prefersReducedMotion]);

  const handlePrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + dashboardSlides.length) % dashboardSlides.length);
  }, [dashboardSlides.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % dashboardSlides.length);
  }, [dashboardSlides.length]);

  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-b from-stone-50 to-white px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Texte Gauche */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2"
            >
              <Sparkles className="h-5 w-5 text-orange-600" aria-hidden="true" />
              <span className="font-outfit text-sm font-semibold text-orange-700">
                Application Parent
              </span>
            </motion.div>

            {/* Titre */}
            <h2 className="mb-6 font-playfair text-4xl font-bold text-[#1c1917] sm:text-5xl lg:text-6xl">
              Veillez sur eux,{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                d&apos;un simple regard.
              </span>
            </h2>

            {/* Sous-titre */}
            <p className="mb-10 font-outfit text-lg leading-relaxed text-[#57534e] sm:text-xl">
              Ajoutez une allergie, validez une nounou ou consultez un vaccin. Vous avez le super-pouvoir de tout gérer depuis votre poche.
            </p>

            {/* Arguments Clés */}
            <div className="space-y-6">
              {/* Argument 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100">
                  <User className="h-6 w-6 text-orange-600" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="mb-1 font-outfit font-semibold text-[#1c1917]">
                    Toute la famille, réunie.
                  </h4>
                  <p className="font-outfit text-sm text-[#57534e]">
                    Hamadou, Malick, Emilie... Chaque enfant a sa carte, sa photo et ses protections spécifiques. Ajoutez un nouveau bracelet en 3 secondes.
                  </p>
                </div>
              </motion.div>

              {/* Argument 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Radio className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="mb-1 font-outfit font-semibold text-[#1c1917]">
                    Une modification ? C'est immédiat.
                  </h4>
                  <p className="font-outfit text-sm text-[#57534e]">
                    Une nouvelle allergie découverte ? Mettez à jour sa fiche. La seconde d'après, le bracelet est à jour. Pas besoin d'en racheter un.
                  </p>
                </div>
              </motion.div>

              {/* Argument 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100">
                  <ShieldCheck className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="mb-1 font-outfit font-semibold text-[#1c1917]">
                    Vos secrets sont bien gardés.
                  </h4>
                  <p className="font-outfit text-sm text-[#57534e]">
                    Vous seul détenez les clés (Codes PIN) pour ouvrir le carnet de santé ou valider les sorties d'école. C'est votre jardin secret.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Carrousel Phone Mockup Droite */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[360px]"
          >
            {/* Phone Mockup statique avec carrousel interne */}
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* iPhone Mockup Frame */}
              <div className="relative overflow-hidden rounded-[3rem] border-[12px] border-gray-900 bg-gray-900 shadow-2xl shadow-black/40">
                {/* Notch iPhone */}
                <div className="absolute left-1/2 top-0 z-10 h-7 w-40 -translate-x-1/2 rounded-b-3xl bg-gray-900" />

                {/* Carrousel d'images à l'intérieur */}
                <div className="relative aspect-[9/19.5] overflow-hidden bg-white">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={dashboardSlides[currentSlide].src}
                        alt={dashboardSlides[currentSlide].alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80vw, 400px"
                        priority={currentSlide === 0}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Subtle glow effect */}
              <div className="absolute -inset-4 -z-10 rounded-[4rem] bg-gradient-to-b from-blue-500/10 to-purple-500/10 blur-2xl opacity-50" />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 z-30 -translate-x-12 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition hover:bg-orange-50 hover:shadow-xl"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-6 w-6 text-orange-600" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 z-30 -translate-y-1/2 translate-x-12 rounded-full bg-white p-3 shadow-lg transition hover:bg-orange-50 hover:shadow-xl"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-6 w-6 text-orange-600" />
              </button>

              {/* Badge flottant "Nouveau" */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, type: 'spring' }}
                className="absolute -right-4 top-12 z-40 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 font-outfit text-sm font-bold text-white shadow-lg"
              >
                ✨ Nouveau
              </motion.div>
            </motion.div>

            {/* Titre Slide Dynamique */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${currentSlide}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-8 text-center"
              >
                <h4 className="mb-2 font-outfit text-xl font-bold text-[#1c1917]">
                  {dashboardSlides[currentSlide].title}
                </h4>
                <p className="font-outfit text-sm text-[#57534e]">
                  {dashboardSlides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Indicateurs de slide */}
            <div className="mt-6 flex justify-center gap-2">
              {dashboardSlides.map((slide, index) => (
                <button
                  key={`slide-${slide.title}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-orange-600'
                      : 'w-2 bg-orange-300 hover:bg-orange-400'
                  }`}
                  aria-label={`Aller à la slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute right-0 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-orange-200/20 blur-3xl" />
    </section>
  );
}

export default DashboardCarouselSection;
