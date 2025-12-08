'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Star } from 'lucide-react';
import { fadeInUpVariants, fadeInLeftVariants, optimizedViewport, performanceClasses } from '@/lib/animations';

export default function IASection() {
  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-br from-blue-50 via-violet-50 to-purple-50 px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Image Shield IA au centre */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={optimizedViewport}
            variants={fadeInUpVariants}
            className={`relative w-full lg:w-1/2 ${performanceClasses.animatedElement}`}
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
                src="/landing/section-ia.webp"
                alt="Intelligence Artificielle SecureID - Protection bienveillante"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                loading="lazy"
              />
              {/* Masque logo Gemini en bas à droite */}
              <div className="absolute bottom-0 right-0 h-[150px] w-[200px] bg-gradient-to-tl from-purple-50 via-violet-50/95 to-transparent" />

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
              initial="hidden"
              whileInView="visible"
              viewport={optimizedViewport}
              variants={fadeInUpVariants}
              className={`mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 ${performanceClasses.animatedElement}`}
            >
              <Sparkles className="h-5 w-5 text-violet-600" aria-hidden="true" />
              <span className="font-outfit text-sm font-semibold text-violet-700">Intelligence Artificielle</span>
            </motion.div>

            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={optimizedViewport}
              variants={fadeInUpVariants}
              className={`font-playfair text-4xl font-bold text-[#1c1917] drop-shadow-sm sm:text-5xl md:text-6xl ${performanceClasses.animatedElement}`}
            >
              Plus qu'un bracelet.{' '}
              <span className="bg-gradient-to-r from-blue-700 to-violet-700 bg-clip-text text-transparent drop-shadow-md">
                Une Intelligence qui veille.
              </span>
            </motion.h2>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={optimizedViewport}
              variants={fadeInUpVariants}
              className={`mt-6 font-outfit text-xl font-medium leading-relaxed text-[#292524] drop-shadow-sm sm:text-2xl ${performanceClasses.animatedElement}`}
            >
              Propulsé par une <span className="font-bold text-violet-700">IA</span> qui assiste les secouristes.
            </motion.p>

            {/* Points Clés avec Étoiles */}
            <div className="mt-8 space-y-4">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={optimizedViewport}
                variants={fadeInLeftVariants}
                className={`flex items-start gap-3 ${performanceClasses.animatedElement}`}
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
                initial="hidden"
                whileInView="visible"
                viewport={optimizedViewport}
                variants={fadeInLeftVariants}
                className={`flex items-start gap-3 ${performanceClasses.animatedElement}`}
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
  );
}
