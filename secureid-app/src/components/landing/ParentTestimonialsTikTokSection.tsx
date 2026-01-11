'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Quote } from 'lucide-react';

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
  embedCode: string;
  caption?: string;
}

export default function ParentTestimonialsTikTokSection() {
  // Charger le script TikTok embed (une seule fois)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup si besoin
      const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Codes embed TikTok de parents cherchant leurs enfants
  const tiktokEmbeds: TikTokEmbed[] = [
    {
      id: '1',
      embedCode: '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@yaramomagassouba/video/7558224161739410702" data-video-id="7558224161739410702" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@yaramomagassouba" href="https://www.tiktok.com/@yaramomagassouba?refer=embed">@yaramomagassouba</a> <p></p> <a target="_blank" title="♬ original sound - Yaramo Magassouba" href="https://www.tiktok.com/music/original-sound-7558224234930654007?refer=embed">♬ original sound - Yaramo Magassouba</a> </section> </blockquote>',
      caption: 'Témoignage Yaramo Magassouba',
    },
    {
      id: '2',
      embedCode: '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@canal3burkina/video/7553731807838063928" data-video-id="7553731807838063928" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@canal3burkina" href="https://www.tiktok.com/@canal3burkina?refer=embed">@canal3burkina</a> Disparition d\'enfants : un phénomène de plus en plus inquiétant  Des avis de recherche sont publiés à travers les réseaux sociaux et les médias. Ces disparitions sont de plus en plus inquiétantes dans les rues de Ouagadougou. Des témoins en parlent dans ce reportage.<a title="ouagadougou" target="_blank" href="https://www.tiktok.com/tag/ouagadougou?refer=embed">#Ouagadougou</a> <a title="burkinafaso" target="_blank" href="https://www.tiktok.com/tag/burkinafaso?refer=embed">#BurkinaFaso</a> <a target="_blank" title="♬ son original - Canal3burkina" href="https://www.tiktok.com/music/son-original-7553731849417509688?refer=embed">♬ son original - Canal3burkina</a> </section> </blockquote>',
      caption: 'Reportage Canal3 Burkina - Disparitions inquiétantes',
    },
    {
      id: '3',
      embedCode: '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@acn_gabon3/video/7586415331686616332" data-video-id="7586415331686616332" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@acn_gabon3" href="https://www.tiktok.com/@acn_gabon3?refer=embed">@acn_gabon3</a> ⚠️ ALERTE DISPARITION – APPEL À LA SOLIDARITÉ Un enfant de 13 ans, Loko Pascal, est porté disparu à Nzeng-Ayong. Sorti jeudi vers 19h pour aller à la boutique près de son domicile, il n\'est jamais rentré et n\'a toujours pas été retrouvé à ce jour. 👉 Si vous l\'avez vu ou si vous détenez la moindre information, merci de contacter immédiatement la famille : 📞 074 19 55 35 📞 074 40 37 03 📞 066 13 76 87 🙏 Partagez massivement. Chaque minute compte. Chaque vie compte. <a title="gabon" target="_blank" href="https://www.tiktok.com/tag/gabon?refer=embed">#Gabon</a> <a title="acnnews" target="_blank" href="https://www.tiktok.com/tag/acnnews?refer=embed">#acnnews</a> <a target="_blank" title="♬ son original - ACN_GABON" href="https://www.tiktok.com/music/son-original-7586415351894657804?refer=embed">♬ son original - ACN_GABON</a> </section> </blockquote>',
      caption: 'Alerte disparition Loko Pascal, 13 ans - Gabon',
    },
    {
      id: '4',
      embedCode: '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@jourjlalumiere/video/7573030894202539286" data-video-id="7573030894202539286" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@jourjlalumiere" href="https://www.tiktok.com/@jourjlalumiere?refer=embed">@jourjlalumiere</a> la fille de la chantre lyha retrouvée après 3 jours <a title="fyp" target="_blank" href="https://www.tiktok.com/tag/fyp?refer=embed">#fyp</a> <a title="pourtoi" target="_blank" href="https://www.tiktok.com/tag/pourtoi?refer=embed">#pourtoi</a> <a title="viral" target="_blank" href="https://www.tiktok.com/tag/viral?refer=embed">#viral</a> <a title="visibilité" target="_blank" href="https://www.tiktok.com/tag/visibilit%C3%A9?refer=embed">#visibilité</a> <a target="_blank" title="♬ son original - Le Fils de Apoutchou National" href="https://www.tiktok.com/music/son-original-7573030897654516502?refer=embed">♬ son original - Le Fils de Apoutchou National</a> </section> </blockquote>',
      caption: 'Fille de la chantre Lyha retrouvée après 3 jours',
    },
    {
      id: '5',
      embedCode: '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@sidiabassemaiga64/video/7559232596270419212" data-video-id="7559232596270419212" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@sidiabassemaiga64" href="https://www.tiktok.com/@sidiabassemaiga64?refer=embed">@sidiabassemaiga64</a> <p>aide moi a partager avis de recherche disparu depuis 1er septembre a tampouy </p> <a target="_blank" title="♬ son original - Aliyou Abdrahman" href="https://www.tiktok.com/music/son-original-7310703221578730245?refer=embed">♬ son original - Aliyou Abdrahman</a> </section> </blockquote>',
      caption: 'Avis de recherche - Disparu depuis 1er septembre à Tampouy',
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

        {/* Grille Vidéos TikTok */}
        <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:gap-12">
          {tiktokEmbeds.map((embed, index) => (
            <motion.div
              key={embed.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* TikTok Embed Container */}
              <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 p-1 backdrop-blur-sm">
                {/* Placeholder si code embed vide */}
                {!embed.embedCode ? (
                  <div className="flex aspect-[9/16] items-center justify-center bg-slate-800 rounded-xl">
                    <div className="text-center">
                      <Quote className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                      <p className="font-outfit text-sm text-slate-400">
                        Vidéo TikTok #{embed.id}
                      </p>
                      <p className="mt-2 font-outfit text-xs text-slate-500">
                        {embed.caption}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Code embed TikTok sera inséré ici
                  <div
                    className="tiktok-embed-wrapper"
                    dangerouslySetInnerHTML={{ __html: embed.embedCode }}
                  />
                )}
              </div>

              {/* Caption */}
              {embed.caption && (
                <p className="mt-3 text-center font-outfit text-sm text-slate-400">
                  {embed.caption}
                </p>
              )}
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
  );
}
