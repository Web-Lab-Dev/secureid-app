'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ShieldSection() {
  return (
    <section className="relative z-10 bg-white px-4 py-20 sm:py-32">
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
              className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-xl shadow-orange-100/50"
            >
              <div className="relative h-full w-full">
                <Image
                  src="/landing/bouclier.webp"
                  alt="Bouclier de protection 3D"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="object-contain drop-shadow-2xl rounded-3xl"
                  loading="lazy"
                />
              </div>
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
  );
}
