'use client';

import { motion } from 'framer-motion';
import { Heart, ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';

/**
 * SECTION TÉMOIGNAGES TIKTOK PARENTS
 *
 * Objectif: Créer un choc émotionnel en montrant la réalité tragique
 * de parents cherchant désespérément leurs enfants perdus.
 *
 * Positionnement: Après IASection, AVANT GeofencingSection
 * Impact psychologique: Peur viscérale → transition vers solution (Geofencing)
 *
 * Note: Les vidéos TikTok sont liées directement (ouverture nouvel onglet)
 * car les embeds TikTok nécessitent des configurations serveur spécifiques
 */

interface TikTokVideo {
  id: string;
  videoId: string;
  username: string;
  caption: string;
  thumbnailUrl: string;
}

export default function ParentTestimonialsTikTokSection() {
  // Vidéos TikTok de parents cherchant leurs enfants
  const tiktokVideos: TikTokVideo[] = [
    {
      id: '1',
      videoId: '7558224161739410702',
      username: 'yaramomagassouba',
      caption: 'Témoignage Yaramo Magassouba',
      thumbnailUrl: '/landing/tiktok-placeholder.jpg',
    },
    {
      id: '2',
      videoId: '7553731807838063928',
      username: 'canal3burkina',
      caption: 'Reportage Canal3 Burkina - Disparitions inquiétantes',
      thumbnailUrl: '/landing/tiktok-placeholder.jpg',
    },
    {
      id: '3',
      videoId: '7586415331686616332',
      username: 'acn_gabon3',
      caption: 'Alerte disparition Loko Pascal, 13 ans - Gabon',
      thumbnailUrl: '/landing/tiktok-placeholder.jpg',
    },
    {
      id: '4',
      videoId: '7573030894202539286',
      username: 'jourjlalumiere',
      caption: 'Fille de la chantre Lyha retrouvée après 3 jours',
      thumbnailUrl: '/landing/tiktok-placeholder.jpg',
    },
    {
      id: '5',
      videoId: '7559232596270419212',
      username: 'sidiabassemaiga64',
      caption: 'Avis de recherche - Disparu depuis 1er septembre à Tampouy',
      thumbnailUrl: '/landing/tiktok-placeholder.jpg',
    },
  ];

  return (
    <section className="relative z-10 overflow-hidden bg-slate-900 px-4 py-20 sm:py-32">
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

        {/* Grille Vidéos TikTok - Cards cliquables */}
        <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:gap-12">
          {tiktokVideos.map((video, index) => (
            <motion.a
              key={video.id}
              href={`https://www.tiktok.com/@${video.username}/video/${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative mx-auto w-full max-w-[605px] cursor-pointer"
            >
              {/* Card Container */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/70 hover:scale-[1.02]">
                {/* Aspect ratio container pour video TikTok (9:16) */}
                <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-slate-900">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/20 z-10" />

                  {/* Play button overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/90 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500">
                      <Play className="h-10 w-10 text-white fill-white ml-1" />
                    </div>
                  </div>

                  {/* TikTok logo en haut à droite */}
                  <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 backdrop-blur-sm">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" className="text-white" />
                    </svg>
                    <span className="font-outfit text-xs font-semibold text-white">
                      TikTok
                    </span>
                  </div>

                  {/* Username en bas */}
                  <div className="absolute bottom-4 left-4 z-20">
                    <p className="font-outfit text-sm font-semibold text-white">
                      @{video.username}
                    </p>
                  </div>

                  {/* Background placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                </div>

                {/* External link icon */}
                <div className="absolute right-6 top-6 z-30 rounded-full bg-slate-900/80 p-2 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ExternalLink className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Caption */}
              <p className="mt-3 text-center font-outfit text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                {video.caption}
              </p>

              {/* Indicateur "Cliquer pour voir" */}
              <p className="mt-1 text-center font-outfit text-xs text-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Cliquer pour voir la vidéo →
              </p>
            </motion.a>
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
  );
}
