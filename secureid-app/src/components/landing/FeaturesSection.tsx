'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Radio, GraduationCap } from 'lucide-react';

export default function FeaturesSection() {
  return (
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
                src="/landing/feature-identity-joy.webp"
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
                src="/landing/feature-medical-kit.webp"
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

          {/* Carte 4: L'Allié de l'École */}
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
  );
}
