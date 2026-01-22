'use client';

import { motion } from 'framer-motion';
import { Shield, Battery, Droplet } from 'lucide-react';

/**
 * Section Démo Produit "L'Armure Invisible"
 * Présente les caractéristiques physiques du bracelet
 */
export function ProductDemoSection() {
  return (
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
            className="h-full w-full object-cover rounded-3xl"
          >
            <source src="/landing/video-demo.mp4" type="video/mp4" />
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
  );
}

export default ProductDemoSection;
