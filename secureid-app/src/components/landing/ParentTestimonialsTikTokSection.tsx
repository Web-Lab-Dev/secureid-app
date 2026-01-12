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
  // Toutes les images d'annonces de disparitions (optimisées)
  const announcements: MissingChildAnnouncement[] = [
    {
      id: '1',
      imagePath: '/annonce des reseaux sociaux/1748349037195.jpg',
      caption: 'Avis de disparition',
      source: 'Réseaux sociaux',
    },
    {
      id: '2',
      imagePath: '/annonce des reseaux sociaux/514259469_1185791096901315_6877600043205809416_n.jpg',
      caption: 'Enfant disparu',
      source: 'Facebook',
    },
    {
      id: '3',
      imagePath: '/annonce des reseaux sociaux/544957735_10237655735722780_3340514364428526235_n.jpg',
      caption: 'Recherche active',
      source: 'Facebook',
    },
    {
      id: '4',
      imagePath: '/annonce des reseaux sociaux/557937877_4297361353837930_1250918240654904926_n.jpg',
      caption: 'Alerte disparition',
      source: 'Facebook',
    },
    {
      id: '5',
      imagePath: '/annonce des reseaux sociaux/583654316_1423064349819038_4680589400454605467_n.jpg',
      caption: 'Recherche urgente',
      source: 'Facebook',
    },
    {
      id: '6',
      imagePath: '/annonce des reseaux sociaux/588892192_1263915672431986_6023818595300189528_n.jpg',
      caption: 'Avis de recherche',
      source: 'Facebook',
    },
    {
      id: '7',
      imagePath: '/annonce des reseaux sociaux/595822435_1414423353361131_7727737243419955463_n.jpg',
      caption: 'Enfant disparu',
      source: 'Facebook',
    },
    {
      id: '8',
      imagePath: '/annonce des reseaux sociaux/608965602_1573755057098913_1992962891135442864_n.jpg',
      caption: 'Alerte disparition',
      source: 'Facebook',
    },
    {
      id: '9',
      imagePath: '/annonce des reseaux sociaux/G8EhmZCWUAEpX1y.jpg',
      caption: 'Recherche active',
      source: 'Réseaux sociaux',
    },
    {
      id: '10',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_111537_www.facebook.com.jpeg",
      caption: 'Avis de disparition',
      source: 'Facebook',
    },
    {
      id: '11',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_111633_www.facebook.com.jpeg",
      caption: 'Recherche urgente',
      source: 'Facebook',
    },
    {
      id: '12',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_111821_www.facebook.com.jpeg",
      caption: 'Enfant disparu',
      source: 'Facebook',
    },
    {
      id: '13',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_11262_www.facebook.com.jpeg",
      caption: 'Alerte disparition',
      source: 'Facebook',
    },
    {
      id: '14',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_112931_www.facebook.com.jpeg",
      caption: 'Recherche active',
      source: 'Facebook',
    },
    {
      id: '15',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_113250_www.facebook.com.jpeg",
      caption: 'Avis de recherche',
      source: 'Facebook',
    },
    {
      id: '16',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_11329_www.facebook.com.jpeg",
      caption: 'Enfant disparu',
      source: 'Facebook',
    },
    {
      id: '17',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_113430_www.facebook.com.jpeg",
      caption: 'Alerte disparition',
      source: 'Facebook',
    },
    {
      id: '18',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_113641_www.facebook.com.jpeg",
      caption: 'Recherche urgente',
      source: 'Facebook',
    },
    {
      id: '19',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_114035_www.facebook.com.jpeg",
      caption: 'Avis de disparition',
      source: 'Facebook',
    },
    {
      id: '20',
      imagePath: "/annonce des reseaux sociaux/Capture d'écran_5-1-2026_115913_x.com.jpeg",
      caption: 'Recherche urgente',
      source: 'X (Twitter)',
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
          transition={{ duration: 0.5 }}
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
          <div className="flex gap-6 animate-scroll-horizontal" style={{ width: 'max-content' }}>
            {duplicatedAnnouncements.map((announcement, index) => (
              <div
                key={`announcement-${index}`}
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
                      quality={85}
                      loading="lazy"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />

                    {/* Badge "AVIS DE RECHERCHE" */}
                    <div className="absolute top-3 left-3 rounded-lg bg-red-500 px-3 py-1 font-outfit text-xs font-bold text-white shadow-lg">
                      🚨 URGENT
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistique choc */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
          transition={{ duration: 0.5, delay: 0.3 }}
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
          animation: scroll-horizontal 20s linear infinite;
        }

        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
