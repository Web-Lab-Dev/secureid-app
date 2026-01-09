'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart } from 'lucide-react';

// Import du composant PhoneMockup - à définir ou importer depuis page.tsx
interface PhoneMockupProps {
  src: string;
  alt: string;
  className?: string;
  floatAnimation?: boolean;
  priority?: boolean;
}

// Composant PhoneMockup inline (simplifié pour l'autonomie du composant)
function PhoneMockup({ src, alt, className = '', floatAnimation = false, priority = false }: PhoneMockupProps) {
  return (
    <motion.div
      animate={
        floatAnimation
          ? {
              y: [0, -15, 0],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : undefined
      }
      className={`relative ${className}`}
    >
      {/* iPhone Mockup Frame */}
      <div className="relative overflow-hidden rounded-[3rem] border-[12px] border-gray-900 bg-gray-900 shadow-2xl shadow-black/40">
        {/* Notch iPhone */}
        <div className="absolute left-1/2 top-0 z-10 h-7 w-40 -translate-x-1/2 rounded-b-3xl bg-gray-900" />

        {/* Screenshot */}
        <div className="relative aspect-[9/19.5] overflow-hidden bg-white">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 300px, 400px"
            className="object-cover"
            priority={priority}
          />
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute -inset-4 -z-10 rounded-[4rem] bg-gradient-to-b from-blue-500/10 to-purple-500/10 blur-2xl opacity-50" />
    </motion.div>
  );
}

export default function SecoursiteSection() {
  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {/* En-tête Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 backdrop-blur-sm">
            <Heart className="h-5 w-5 text-red-400" aria-hidden="true" />
            <span className="font-outfit text-sm font-semibold text-red-300">Interface Secouriste</span>
          </div>

          {/* Titre */}
          <h2 className="mb-6 font-playfair text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Conçu pour{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              l'efficacité absolue.
            </span>
          </h2>

          {/* Sous-titre */}
          <p className="mx-auto max-w-3xl font-outfit text-lg leading-relaxed text-slate-300 sm:text-xl">
            Aucune friction. Aucune application à installer pour le secouriste.{' '}
            <span className="font-semibold text-white">Juste l'essentiel.</span>
          </p>
        </motion.div>

        {/* 3 Phones Overlap - Responsive viewport height */}
        <div className="relative mx-auto max-w-5xl max-h-[60vh] flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 md:gap-0">
            {/* Phone 1 - Gauche (Alerte) */}
            <motion.div
              initial={{ opacity: 0, x: -100, rotateY: -15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 w-32 sm:w-36 md:w-40 lg:w-44 md:-mr-12"
              style={{ perspective: '1000px' }}
            >
              <PhoneMockup
                src="/landing/showcase/secouriste page/secouriste acceuil.jpg"
                alt="Alerte Vitale Secouriste"
                className="rotate-[-5deg] transform"
              />
              {/* Label */}
              <div className="mt-2 text-center">
                <p className="font-outfit text-xs sm:text-sm font-semibold text-red-400">Alerte Vitale</p>
                <p className="font-outfit text-[10px] sm:text-xs text-slate-400">Infos médicales en 2s</p>
              </div>
            </motion.div>

            {/* Phone 2 - Centre (IA Assistance) - Plus grand */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative z-20 w-40 sm:w-44 md:w-48 lg:w-52"
            >
              <PhoneMockup
                src="/landing/showcase/secouriste page/secouriste ia.jpg"
                alt="IA Assistance Médicale"
                floatAnimation
                priority
              />
              {/* Badge "Certifié" */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, type: 'spring' }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 sm:px-4 sm:py-2 font-outfit text-xs sm:text-sm font-bold text-white shadow-lg"
              >
                Son Passeport
              </motion.div>
              {/* Label */}
              <div className="mt-2 text-center">
                <p className="font-outfit text-xs sm:text-sm font-semibold text-emerald-400">IA Bienveillante</p>
                <p className="font-outfit text-[10px] sm:text-xs text-slate-400">Gestes vitaux guidés</p>
              </div>
            </motion.div>

            {/* Phone 3 - Droite (GPS) */}
            <motion.div
              initial={{ opacity: 0, x: 100, rotateY: 15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative z-10 w-32 sm:w-36 md:w-40 lg:w-44 md:-ml-12"
              style={{ perspective: '1000px' }}
            >
              <PhoneMockup
                src="/landing/showcase/secouriste page/send position.jpg"
                alt="GPS et WhatsApp Parents"
                className="rotate-[5deg] transform"
              />
              {/* Label */}
              <div className="mt-2 text-center">
                <p className="font-outfit text-xs sm:text-sm font-semibold text-blue-400">GPS WhatsApp</p>
                <p className="font-outfit text-[10px] sm:text-xs text-slate-400">Contact immédiat</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid gap-8 sm:grid-cols-3"
        >
          {/* Stat 1 */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center backdrop-blur-sm">
            <p className="mb-2 font-playfair text-4xl font-bold text-orange-400">{'<2s'}</p>
            <p className="font-outfit text-sm text-slate-300">Temps de réponse moyen</p>
          </div>

          {/* Stat 2 */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center backdrop-blur-sm">
            <p className="mb-2 font-playfair text-4xl font-bold text-emerald-400">100%</p>
            <p className="font-outfit text-sm text-slate-300">Sans installation</p>
          </div>

          {/* Stat 3 */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center backdrop-blur-sm">
            <p className="mb-2 font-playfair text-4xl font-bold text-blue-400">500+</p>
            <p className="font-outfit text-sm text-slate-300">Familles protégées</p>
          </div>
        </motion.div>
      </div>

      {/* Background effects */}
      <div className="absolute left-0 top-1/4 -z-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
    </section>
  );
}
