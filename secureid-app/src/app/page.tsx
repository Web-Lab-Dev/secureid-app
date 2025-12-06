'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Heart, Radio, User, Phone } from 'lucide-react';
import { useRef } from 'react';

/**
 * PHASE 10 - LANDING PAGE ÉMOTIONNELLE "WARM & SAFE"
 *
 * Direction artistique : Terre & Solaire
 * Copywriting : Parental, rassurant, sans jargon technique
 * Animations : Framer Motion fluides, scrollytelling
 */

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
              <Shield className="h-5 w-5" />
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
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-8 w-5 rounded-full border-2 border-orange-400/50"
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
      <div className="relative -mt-1">
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

      {/* SECTION 2: LE BOUCLIER INVISIBLE */}
      <section className="bg-white px-4 py-20 sm:py-32">
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
                  className="object-contain"
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
      <section className="bg-[#FFF7ED] px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl"
          >
            Trois promesses pour votre tranquillité
          </motion.h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="object-cover"
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
                  className="object-cover"
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
                  <Heart className="h-8 w-8 text-white drop-shadow-lg" strokeWidth={2} fill="currentColor" />
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
              className="group rounded-3xl bg-white p-8 shadow-xl shadow-orange-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200 sm:col-span-2 lg:col-span-1"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500">
                <Radio className="h-8 w-8 text-white" strokeWidth={2} />
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
          </div>
        </div>
      </section>

      {/* SECTION 4: TÉMOIGNAGES */}
      <section className="bg-white px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl"
          >
            Ils nous font confiance
          </motion.h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Témoignage 1 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-amber-50 p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-200">
                  <User className="h-7 w-7 text-amber-700" />
                </div>
                <div>
                  <p className="font-outfit font-semibold text-[#1c1917]">Aminata K.</p>
                  <p className="font-outfit text-sm text-[#78716c]">Ouagadougou</p>
                </div>
              </div>
              <p className="font-outfit italic leading-relaxed text-[#44403c]">
                "Maintenant je pars travailler l'esprit tranquille. Je sais que si quelque chose
                arrive, les informations de mon fils sont là."
              </p>
            </motion.div>

            {/* Témoignage 2 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-orange-50 p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-200">
                  <User className="h-7 w-7 text-orange-700" />
                </div>
                <div>
                  <p className="font-outfit font-semibold text-[#1c1917]">Ibrahim S.</p>
                  <p className="font-outfit text-sm text-[#78716c]">Bobo-Dioulasso</p>
                </div>
              </div>
              <p className="font-outfit italic leading-relaxed text-[#44403c]">
                "Le bracelet a sauvé du temps précieux. Les infirmiers ont pu voir ses allergies
                immédiatement et agir vite."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA FINAL */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0">
          <Image
            src="/landing/cta-father-hand.png"
            alt="Main protectrice d'un père"
            fill
            className="object-cover"
            style={{ objectPosition: 'center' }}
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
              <Shield className="h-6 w-6" strokeWidth={2.5} />
              Activer sa protection maintenant
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-[#FAFAF9] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Colonne 1: Logo et description */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-8 w-8 text-amber-600" strokeWidth={2} />
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
              <ul className="space-y-2 font-outfit text-sm text-[#78716c]">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+226 77 04 04 92 / 72 98 25 02</span>
                </li>
                <li>
                  <a
                    href="mailto:tko364796@gmail.com"
                    className="hover:text-amber-600 transition-colors"
                  >
                    tko364796@gmail.com
                  </a>
                </li>
              </ul>
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
          <Shield className="h-5 w-5" />
          ACTIVER SA PROTECTION
        </Link>
      </motion.div>
    </div>
  );
}
