'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Image from 'next/image';

/**
 * SECTION TÉMOIGNAGES PARENTS - ANNONCES DISPARITIONS
 *
 * Objectif: Créer un choc émotionnel en montrant la réalité tragique
 * de parents cherchant désespérément leurs enfants perdus.
 *
 * Positionnement: Après IASection, AVANT GeofencingSection
 * Impact psychologique: Peur viscérale → transition vers solution (Geofencing)
 *
 * Format: Carrousel défilant horizontal (bande défilante) avec 5 images d'annonces
 * Style: Scroll automatique infini, responsive mobile-first
 */

interface MissingChildAnnouncement {
  id: string;
  imagePath: string;
  caption: string;
  source: string;
}

export default function ParentTestimonialsTikTokSection() {
  // 5 meilleures images d'annonces de disparitions (vraies annonces Facebook/TikTok)
  const announcements: MissingChildAnnouncement[] = [
    {
      id: '1',
      imagePath: '/annonce des reseaux sociaux/1748349037195.jpg',
      caption: 'Avis de recherche - Ouagadougou',
      source: 'Réseaux sociaux Burkina Faso',
    },
    {
      id: '2',
      imagePath: '/annonce des reseaux sociaux/588892192_1263915672431986_6023818595300189528_n.jpg',
      caption: 'Enfant disparu - Appel à témoins',
      source: 'Facebook Parents BF',
    },
    {
      id: '3',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_11139_www.facebook.com.jpeg",
      caption: 'Alerte disparition - Urgent',
      source: 'Facebook Communauté',
    },
    {
      id: '4',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_112227_www.facebook.com.jpeg",
      caption: 'Recherche active en cours',
      source: 'Communauté Facebook',
    },
    {
      id: '5',
      imagePath: '/annonce des reseaux sociaux/608965602_1573755057098913_1992962891135442864_n.jpg',
      caption: 'Avis de disparition',
      source: 'Réseaux sociaux locaux',
    },
  ];

  // Dupliquer les annonces pour créer un effet de loop infini
  const duplicatedAnnouncements = [...announcements, ...announcements];

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
            Ces annonces inondent les réseaux sociaux. Des familles déchirées.{' '}
            <span className="font-semibold text-white">
              Aucune famille ne devrait vivre cela.
            </span>
          </p>
        </motion.div>

        {/* Carrousel défilant automatique (bande défilante) */}
        <div className="relative mb-16 overflow-hidden">
          {/* Gradient fade gauche */}
          <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />

          {/* Gradient fade droite */}
          <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

          {/* Container de défilement */}
          <div className="flex gap-6 animate-scroll-horizontal">
            {duplicatedAnnouncements.map((announcement, index) => (
              <motion.div
                key={`${announcement.id}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex-shrink-0 w-[280px] sm:w-[320px]"
              >
                {/* Card annonce */}
                <div className="group relative overflow-hidden rounded-2xl bg-slate-800/50 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/70 hover:scale-[1.02]">
                  {/* Image annonce */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-900">
                    {/* Image réelle de l'annonce */}
                    <Image
                      src={announcement.imagePath}
                      alt={announcement.caption}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="320px"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />

                    {/* Badge "AVIS DE RECHERCHE" */}
                    <div className="absolute top-3 left-3 rounded-lg bg-red-500 px-3 py-1 font-outfit text-xs font-bold text-white shadow-lg">
                      🚨 URGENT
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="mt-3">
                    <p className="font-outfit text-sm font-semibold text-white">
                      {announcement.caption}
                    </p>
                    <p className="mt-1 font-outfit text-xs text-slate-400">
                      {announcement.source}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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

      {/* Styles pour l'animation de défilement */}
      <style jsx>{`
        @keyframes scroll-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-horizontal {
          animation: scroll-horizontal 30s linear infinite;
        }

        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
