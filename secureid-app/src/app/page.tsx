'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Heart, Radio, User, Phone, CloudOff, ShieldCheck, GraduationCap, Star, Sparkles, Battery, Droplet, Building2, ChevronLeft, ChevronRight, Mail, Linkedin, Facebook, Github, MessageCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

/**
 * PHASE 10 - LANDING PAGE ÉMOTIONNELLE "WARM & SAFE"
 *
 * Direction artistique : Terre & Solaire
 * Copywriting : Parental, rassurant, sans jargon technique
 * Animations : Framer Motion fluides, scrollytelling
 *
 * SEO: Metadata définis dans layout.tsx parent
 */

/**
 * PHASE 12 - Composant Carrousel Témoignages
 */
interface Testimonial {
  id: string;
  name: string;
  city: string;
  quote: string;
  bgColor: 'amber' | 'orange' | 'rose';
}

const testimonials: Testimonial[] = [
  {
    id: 'aminata',
    name: 'Aminata K.',
    city: 'Ouagadougou',
    quote:
      "Maintenant je pars travailler l'esprit tranquille. Je sais que si quelque chose arrive, les informations de mon fils sont là.",
    bgColor: 'amber',
  },
  {
    id: 'ibrahim',
    name: 'Ibrahim S.',
    city: 'Bobo-Dioulasso',
    quote:
      "Le bracelet a sauvé du temps précieux. Les infirmiers ont pu voir ses allergies immédiatement et agir vite.",
    bgColor: 'orange',
  },
];

function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-rotation toutes les 5 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const bgColorClasses = {
    amber: 'bg-amber-50',
    orange: 'bg-orange-50',
    rose: 'bg-rose-50',
  };

  const iconBgClasses = {
    amber: 'bg-amber-200',
    orange: 'bg-orange-200',
    rose: 'bg-rose-200',
  };

  const iconTextClasses = {
    amber: 'text-amber-700',
    orange: 'text-orange-700',
    rose: 'text-rose-700',
  };

  const currentTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section className="relative z-10 bg-white px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl"
        >
          Ils nous font confiance
        </motion.h2>

        {/* Carrousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 z-10 -translate-x-12 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 sm:-translate-x-16"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="h-6 w-6 text-stone-700" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-12 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 sm:translate-x-16"
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="h-6 w-6 text-stone-700" />
          </button>

          {/* Testimonials Slider */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className={`rounded-2xl ${bgColorClasses[currentTestimonial.bgColor]} p-8 sm:p-12`}
              >
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBgClasses[currentTestimonial.bgColor]}`}
                  >
                    <User
                      className={`h-7 w-7 ${iconTextClasses[currentTestimonial.bgColor]}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-outfit font-semibold text-[#1c1917]">
                      {currentTestimonial.name}
                    </p>
                    <p className="font-outfit text-sm text-[#78716c]">
                      {currentTestimonial.city}
                    </p>
                  </div>
                </div>
                <p className="font-outfit text-lg italic leading-relaxed text-[#44403c] sm:text-xl">
                  "{currentTestimonial.quote}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicateurs de pagination */}
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-orange-500'
                    : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Aller au témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Effet Ken Burns (zoom lent) sur l'image hero
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="overflow-x-hidden bg-[#FAFAF9]">
      {/* SECTION 1: HERO ÉMOTIONNEL */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Image de fond FIXE (parallax) */}
        <div className="fixed inset-0 h-screen w-full">
          <Image
            src="/landing/hero-mother-child.png"
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

          {/* CTA Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-10"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-4 font-outfit text-lg font-semibold text-white shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/50"
            >
              <Shield className="h-5 w-5" aria-hidden="true" />
              Activer sa protection
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

      {/* PHASE 12: TRUST BAR - Bandeau Institutionnel Défilant */}
      <section className="relative z-10 overflow-hidden bg-stone-50/50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-stone-400"
          >
            Conçu selon les standards de sécurité et de protection
          </motion.p>

          {/* Bandeau défilant infini */}
          <div className="relative overflow-hidden">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="flex items-center gap-12 whitespace-nowrap"
            >
              {/* Premier set de logos */}
              {[...Array(3)].map((_, setIndex) => (
                <div key={setIndex} className="flex items-center gap-12">
                  {/* Logo CIL */}
                  <div
                    className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-70"
                    title="Commission de l'Informatique et des Libertés"
                  >
                    <ShieldCheck className="h-10 w-10 text-stone-700" aria-hidden="true" />
                    <span className="text-xs font-medium text-stone-600">CIL</span>
                  </div>

                  {/* Logo BNSP */}
                  <div
                    className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-70"
                    title="Brigade Nationale de Sapeurs-Pompiers"
                  >
                    <Shield className="h-10 w-10 text-stone-700" aria-hidden="true" />
                    <span className="text-xs font-medium text-stone-600">BNSP</span>
                  </div>

                  {/* Logo Ministère */}
                  <div
                    className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-70"
                    title="Ministère de la Famille - Protection de l'Enfance"
                  >
                    <Building2 className="h-10 w-10 text-stone-700" aria-hidden="true" />
                    <span className="text-xs font-medium text-stone-600">Min. Famille</span>
                  </div>

                  {/* Logo Standards Médicaux */}
                  <div
                    className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-70"
                    title="Standards Médicaux Certifiés"
                  >
                    <Heart className="h-10 w-10 text-stone-700" aria-hidden="true" />
                    <span className="text-xs font-medium text-stone-600">Standards Médicaux</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* INSERTION A: RÉALITÉ vs SÉRÉNITÉ */}
      <section className="relative z-10 bg-white px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl"
          >
            Pourquoi c'est vital ?
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Carte Problème - Gris */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl bg-stone-100 p-8"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-stone-200">
                <CloudOff className="h-8 w-8 text-stone-600" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mb-4 font-playfair text-2xl font-bold text-[#1c1917]">
                L'Incertitude
              </h3>
              <p className="font-outfit leading-relaxed text-[#44403c]">
                Dehors, le lien est rompu. En cas de malaise ou d'égarement, les secours ne savent pas qui il est, ni qui appeler. Chaque minute de silence est une angoisse.
              </p>
            </motion.div>

            {/* Carte Solution - Orange */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-8"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-orange-500">
                <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mb-4 font-playfair text-2xl font-bold text-[#1c1917]">
                La Réponse Immédiate
              </h3>
              <p className="font-outfit leading-relaxed text-[#44403c]">
                Il est identifié en 2 secondes. Le médecin accède à ses allergies. Vous recevez son emplacement GPS instantanément.{' '}
                <span className="font-semibold text-orange-700">Le silence est brisé.</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: LE BOUCLIER INVISIBLE */}
      <section className="relative z-10 bg-white px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            {/* Image Shield Protection 3D - 50% de la largeur */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="relative w-full lg:w-1/2"
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative aspect-square w-full"
              >
                <Image
                  src="/landing/shield-protection-3d.png"
                  alt="Bouclier de protection 3D"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="object-contain"
                  loading="lazy"
                />
                {/* Overlay pour masquer le logo Gemini en bas à droite */}
                <div className="absolute bottom-0 right-0 h-16 w-24 bg-white" />
              </motion.div>
            </motion.div>

            {/* Texte - 50% de la largeur */}
            <div className="w-full text-center lg:w-1/2 lg:text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl md:text-5xl"
              >
                Le Bouclier Invisible
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 font-outfit text-lg leading-relaxed text-[#44403c] sm:text-xl"
              >
                Dans la cour de récréation, dans la foule, ou sur le chemin de l'école...
                <br />
                <span className="font-semibold text-amber-700">
                  SecureID veille sur lui quand vos yeux ne le peuvent pas.
                </span>
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LES 3 PROMESSES */}
      <section className="relative z-10 bg-[#FFF7ED] px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl"
          >
            Quatre promesses pour votre tranquillité
          </motion.h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {/* Carte 1: L'Identité */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group rounded-3xl bg-white p-8 shadow-xl shadow-orange-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200"
            >
              <div className="mb-6 relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-orange-100 group-hover:ring-orange-200 transition-all">
                <Image
                  src="/landing/feature-identity-joy.png"
                  alt="Enfant joyeux - Identité protégée"
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#1c1917]">
                L'Identité
              </h3>
              <p className="mt-4 font-outfit leading-relaxed text-[#57534e]">
                S'il s'égare, il n'est plus un inconnu.
                <span className="block mt-2 font-semibold text-amber-700">
                  Il est votre fils.
                </span>
              </p>
            </motion.div>

            {/* Carte 2: Le Médical */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group rounded-3xl bg-white p-8 shadow-xl shadow-orange-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200"
            >
              <div className="mb-6 relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-rose-100 group-hover:ring-rose-200 transition-all">
                <Image
                  src="/landing/feature-medical-kit.png"
                  alt="Trousse médicale - Santé protégée"
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Heart className="h-8 w-8 text-white drop-shadow-lg" strokeWidth={2} fill="currentColor" aria-hidden="true" />
                </motion.div>
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#1c1917]">
                Le Médical
              </h3>
              <p className="mt-4 font-outfit leading-relaxed text-[#57534e]">
                Ses allergies et besoins vitaux parlent pour lui.
                <span className="block mt-2 font-semibold text-rose-700">
                  Sa santé, toujours avec lui.
                </span>
              </p>
            </motion.div>

            {/* Carte 3: Le Lien */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group rounded-3xl bg-white p-8 shadow-xl shadow-orange-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500">
                <Radio className="h-8 w-8 text-white" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#1c1917]">
                Le Lien
              </h3>
              <p className="mt-4 font-outfit leading-relaxed text-[#57534e]">
                Un lien invisible qui ne rompt jamais.
                <span className="block mt-2 font-semibold text-indigo-700">
                  Le chemin le plus court vers votre voix.
                </span>
              </p>
            </motion.div>

            {/* Carte 4: L'Allié de l'École - NOUVELLE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group rounded-3xl bg-white p-8 shadow-xl shadow-orange-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500">
                <GraduationCap className="h-8 w-8 text-white" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#1c1917]">
                L'Allié de l'École
              </h3>
              <p className="mt-4 font-outfit leading-relaxed text-[#57534e]">
                Fini le stress à 16h.
                <span className="block mt-2 font-semibold text-purple-700">
                  Le bracelet permet à l'école de vérifier instantanément si la nounou est autorisée à récupérer votre enfant.
                </span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INSERTION B: IA BIENVEILLANTE */}
      <section className="relative z-10 overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-violet-50/30 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            {/* Image Shield IA au centre */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="relative w-full lg:w-1/2"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative aspect-square w-full max-w-md mx-auto"
              >
                <Image
                  src="/landing/shield-protection-3d.png"
                  alt="Intelligence Artificielle SecureID - Protection bienveillante"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  loading="lazy"
                />
                {/* Effet de brillance IA */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 via-purple-400/10 to-transparent rounded-full blur-3xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Texte et Points Clés */}
            <div className="w-full text-center lg:w-1/2 lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2"
              >
                <Sparkles className="h-5 w-5 text-violet-600" aria-hidden="true" />
                <span className="font-outfit text-sm font-semibold text-violet-700">Intelligence Artificielle</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl md:text-5xl"
              >
                Plus qu'un bracelet.{' '}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Une Intelligence qui veille.
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 font-outfit text-lg leading-relaxed text-[#44403c] sm:text-xl"
              >
                Propulsé par une <span className="font-semibold text-violet-700">IA</span> qui assiste les secouristes.
              </motion.p>

              {/* Points Clés avec Étoiles */}
              <div className="mt-8 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-start gap-3"
                >
                  <Star className="mt-1 h-6 w-6 flex-shrink-0 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <div>
                    <h4 className="font-outfit font-semibold text-[#1c1917]">Assistant Vital</h4>
                    <p className="mt-1 font-outfit text-[#57534e]">
                      Elle guide les premiers gestes en fonction de ses allergies spécifiques.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <Star className="mt-1 h-6 w-6 flex-shrink-0 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <div>
                    <h4 className="font-outfit font-semibold text-[#1c1917]">Veille Active</h4>
                    <p className="mt-1 font-outfit text-[#57534e]">
                      Elle analyse la zone du scan pour vous rassurer (ex: 'Localisé près de l'école').
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSERTION C: DÉMO PRODUIT "L'ARMURE INVISIBLE" */}
      <section className="relative z-10 bg-stone-900 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-playfair text-4xl font-bold text-white sm:text-5xl">
              Conçu pour{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                la vraie vie.
              </span>
            </h2>
            <p className="mt-4 font-outfit text-lg text-stone-300 sm:text-xl">
              Pas de batterie. Pas d'ondes. 100% Étanche. Indestructible.
            </p>
          </motion.div>

          {/* Vidéo Démo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="relative mb-16 aspect-video overflow-hidden rounded-3xl shadow-2xl shadow-orange-500/20"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            >
              <source src="/landing/Cinematic_Metal_Plate_QR_Code_Video.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo HTML5.
            </video>
          </motion.div>

          {/* Grid Features */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1: Pas de Batterie */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
                <Battery className="h-8 w-8 text-orange-400" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
                0% Batterie requise
              </h3>
              <p className="font-outfit text-stone-400">
                Aucune recharge nécessaire. Il protège jour et nuit, sans jamais s'éteindre.
              </p>
            </motion.div>

            {/* Feature 2: Étanche */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                <Droplet className="h-8 w-8 text-blue-400" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
                100% Étanche
              </h3>
              <p className="font-outfit text-stone-400">
                Il résiste à la boue, à la pluie et aux récréations les plus mouvementées.
              </p>
            </motion.div>

            {/* Feature 3: Indestructible */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Shield className="h-8 w-8 text-emerald-400" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
                Matériaux Hypoallergéniques
              </h3>
              <p className="font-outfit text-stone-400">
                Conçu avec des matériaux certifiés, doux pour la peau. Indestructible.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TÉMOIGNAGES - PHASE 12 CARROUSEL */}
      <TestimonialsCarousel />

      {/* SECTION 5: CTA FINAL */}
      <section className="relative z-10 h-[600px] overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0">
          <Image
            src="/landing/cta-father-hand.png"
            alt="Main protectrice d'un père"
            fill
            sizes="100vw"
            className="object-cover object-center"
            loading="lazy"
          />
          {/* Dark overlay pour faire ressortir le contenu */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
        </div>

        {/* Contenu CTA */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h2 className="mb-6 font-playfair text-4xl font-bold text-white drop-shadow-2xl sm:text-5xl md:text-6xl">
              Parce qu'un parent ne devrait jamais avoir à chercher son enfant
            </h2>
            <p className="mb-10 font-outfit text-lg leading-relaxed text-white/90 drop-shadow-lg sm:text-xl">
              Rejoignez les centaines de familles burkinabé qui ont choisi la tranquillité.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-10 py-5 font-outfit text-xl font-bold text-white shadow-2xl shadow-orange-500/50 transition-all hover:scale-105 hover:shadow-orange-500/70"
            >
              <Shield className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
              Activer sa protection maintenant
            </Link>
          </motion.div>
        </div>
      </section>

      {/* INSERTION D: PARTENARIAT ÉCOLE */}
      <section className="relative z-10 bg-white px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl border-l-4 border-orange-500 bg-orange-50/50 p-8 md:p-12"
          >
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2">
              <Building2 className="h-5 w-5 text-orange-600" aria-hidden="true" />
              <span className="font-outfit text-sm font-semibold text-orange-700">
                Établissements & Garderies
              </span>
            </div>

            {/* Titre */}
            <h2 className="mb-4 font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl">
              Directeurs d'Établissement & Garderies
            </h2>

            {/* Description */}
            <p className="mb-6 font-outfit text-lg leading-relaxed text-[#44403c]">
              La sécurité de vos élèves est votre priorité ? Rejoignez le réseau{' '}
              <span className="font-semibold text-orange-700">'Safe Zone'</span>.{' '}
              Sécurisez les sorties et rassurez vos parents.
            </p>

            {/* CTA Secondaire */}
            <Link
              href="/ecoles-partenaires"
              className="group inline-flex items-center gap-2 font-outfit text-lg font-semibold text-orange-700 underline decoration-2 underline-offset-4 transition-colors hover:text-orange-800"
            >
              Devenir École Partenaire
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-stone-200 bg-[#FAFAF9] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Colonne 1: Logo et description */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-8 w-8 text-amber-600" strokeWidth={2} aria-hidden="true" />
                <span className="font-playfair text-2xl font-bold text-[#1c1917]">SecureID</span>
              </div>
              <p className="font-outfit text-sm leading-relaxed text-[#78716c]">
                Protégez ce qui compte le plus. Un lien invisible qui veille sur vos enfants.
              </p>
            </div>

            {/* Colonne 2: Liens */}
            <div>
              <h3 className="mb-4 font-outfit font-semibold text-[#1c1917]">Informations</h3>
              <ul className="space-y-2 font-outfit text-sm text-[#78716c]">
                <li>
                  <Link href="/login" className="hover:text-amber-600 transition-colors">
                    Activer un bracelet
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-amber-600 transition-colors">
                    Se connecter
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-600 transition-colors">
                    À propos
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonne 3: Contact */}
            <div>
              <h3 className="mb-4 font-outfit font-semibold text-[#1c1917]">Contact</h3>
              <p className="mb-4 font-outfit text-sm font-semibold text-[#1c1917]">
                +226 77 04 04 92 / 72 98 25 02
              </p>

              {/* Logos sociaux avec couleurs de marque */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Téléphone */}
                <a
                  href="tel:+22677040492"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition-all hover:bg-orange-600 hover:scale-110"
                  aria-label="Appeler +226 77 04 04 92"
                  title="Appel"
                >
                  <Phone className="h-5 w-5" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/22677040492"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-all hover:bg-[#20BD5A] hover:scale-110"
                  aria-label="WhatsApp +226 77 04 04 92"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>

                {/* Email */}
                <a
                  href="mailto:tko364796@gmail.com"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EA4335] text-white transition-all hover:bg-[#D33426] hover:scale-110"
                  aria-label="Email tko364796@gmail.com"
                  title="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/swabo-hamadou-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0077B5] text-white transition-all hover:bg-[#006399] hover:scale-110"
                  aria-label="LinkedIn Swabo Hamadou"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>

                {/* Facebook */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition-all hover:bg-[#1565D8] hover:scale-110"
                  aria-label="Facebook SecureID"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>

                {/* GitHub */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181717] text-white transition-all hover:bg-black hover:scale-110"
                  aria-label="GitHub SecureID"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 border-t border-stone-200 pt-8 text-center">
            <p className="font-outfit text-sm text-[#a8a29e]">
              © {new Date().getFullYear()} SecureID. Protégez ce qui compte le plus.
            </p>
          </div>
        </div>
      </footer>

      {/* STICKY BOTTOM BAR (Mobile) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/20 bg-white/80 p-4 backdrop-blur-lg sm:hidden"
      >
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 py-3 font-outfit font-semibold text-white shadow-lg shadow-orange-500/30"
        >
          <Shield className="h-5 w-5" aria-hidden="true" />
          ACTIVER SA PROTECTION
        </Link>
      </motion.div>
    </div>
  );
}
