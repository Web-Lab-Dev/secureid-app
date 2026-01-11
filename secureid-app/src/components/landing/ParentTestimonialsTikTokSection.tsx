'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Script from 'next/script';

/**
 * SECTION TÉMOIGNAGES TIKTOK PARENTS
 *
 * Objectif: Créer un choc émotionnel en montrant la réalité tragique
 * de parents cherchant désespérément leurs enfants perdus.
 *
 * Positionnement: Après IASection, AVANT GeofencingSection
 * Impact psychologique: Peur viscérale → transition vers solution (Geofencing)
 */

interface TikTokEmbed {
  id: string;
  videoId: string;
  username: string;
  caption: string;
}

export default function ParentTestimonialsTikTokSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Vidéos TikTok de parents cherchant leurs enfants
  const tiktokEmbeds: TikTokEmbed[] = [
    {
      id: '1',
      videoId: '7558224161739410702',
      username: 'yaramomagassouba',
      caption: 'Témoignage Yaramo Magassouba',
    },
    {
      id: '2',
      videoId: '7553731807838063928',
      username: 'canal3burkina',
      caption: 'Reportage Canal3 Burkina - Disparitions inquiétantes',
    },
    {
      id: '3',
      videoId: '7586415331686616332',
      username: 'acn_gabon3',
      caption: 'Alerte disparition Loko Pascal, 13 ans - Gabon',
    },
    {
      id: '4',
      videoId: '7573030894202539286',
      username: 'jourjlalumiere',
      caption: 'Fille de la chantre Lyha retrouvée après 3 jours',
    },
    {
      id: '5',
      videoId: '7559232596270419212',
      username: 'sidiabassemaiga64',
      caption: 'Avis de recherche - Disparu depuis 1er septembre à Tampouy',
    },
  ];

  return (
    <>
      {/* Script TikTok officiel */}
      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="lazyOnload"
      />

      <section ref={containerRef} className="relative z-10 overflow-hidden bg-slate-900 px-4 py-20 sm:py-32">
        {/* Background effects */}
        <div className="absolute left-0 top-1/4 -z-10 h-96 w-96 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />

        <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 backdrop-blur-sm">
            <Heart className="h-5 w-5 text-red-400" aria-hidden="true" />
            <span className="font-outfit text-sm font-semibold text-red-300">
              La Réalité
            </span>
          </div>

          {/* Titre Principal */}
          <h2 className="mb-6 font-playfair text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Chaque jour au Burkina Faso,{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              des parents cherchent désespérément
            </span>
          </h2>

          {/* Sous-titre */}
          <p className="mx-auto max-w-3xl font-outfit text-lg leading-relaxed text-slate-300 sm:text-xl">
            Des vidéos qui glacent le sang. Des histoires qui ne devraient jamais exister.{' '}
            <span className="font-semibold text-white">
              Aucune mère ne devrait vivre cela.
            </span>
          </p>
        </motion.div>

        {/* Grille Vidéos TikTok */}
        <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:gap-12">
          {tiktokEmbeds.map((embed, index) => (
            <motion.div
              key={embed.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative mx-auto w-full max-w-[605px]"
            >
              {/* TikTok blockquote - Le script officiel le transformera en iframe */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 p-2 backdrop-blur-sm">
                <blockquote
                  className="tiktok-embed"
                  cite={`https://www.tiktok.com/@${embed.username}/video/${embed.videoId}`}
                  data-video-id={embed.videoId}
                  style={{ maxWidth: '605px', minWidth: '325px', margin: '0 auto' }}
                >
                  <section>
                    <a
                      target="_blank"
                      title={`@${embed.username}`}
                      href={`https://www.tiktok.com/@${embed.username}?refer=embed`}
                      rel="noopener noreferrer"
                    >
                      @{embed.username}
                    </a>
                  </section>
                </blockquote>
              </div>

              {/* Caption */}
              <p className="mt-3 text-center font-outfit text-sm text-slate-400">
                {embed.caption}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Statistique choc */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mb-12 text-center"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-sm">
            <p className="mb-3 font-playfair text-5xl font-bold text-red-400">
              Chaque minute compte
            </p>
            <p className="font-outfit text-lg text-slate-300">
              Plus un enfant est perdu longtemps, plus les risques augmentent.{' '}
              <span className="font-semibold text-white">
                Les premières heures sont cruciales.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Transition vers solution (Geofencing) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 font-outfit text-xl text-slate-200">
              Mais avec SecureID, cette angoisse n'existe plus.
            </p>
            <div className="flex items-center justify-center gap-2 text-orange-400">
              <span className="font-outfit text-lg font-semibold">
                Découvrez comment nous vous protégeons
              </span>
              <svg
                className="h-6 w-6 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </motion.div>
        </div>
      </section>
    </>
  );
}
