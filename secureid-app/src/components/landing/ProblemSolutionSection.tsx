'use client';

import { motion } from 'framer-motion';
import { CloudOff, ShieldCheck } from 'lucide-react';

export default function ProblemSolutionSection() {
  return (
    <section className="relative z-10 bg-white px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl"
        >
          Pourquoi c'est vital ?
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Carte Problème - Gris */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-stone-100 p-8"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-stone-200">
              <CloudOff className="h-8 w-8 text-stone-600" strokeWidth={2} aria-hidden="true" />
            </div>
            <h3 className="mb-4 font-playfair text-2xl font-bold text-[#1c1917]">
              L'Incertitude
            </h3>
            <p className="font-outfit leading-relaxed text-[#44403c]">
              Dehors, le lien est rompu. En cas de malaise ou d'égarement, les secours ne savent pas qui il est, ni qui appeler. Chaque minute de silence est une angoisse.
            </p>
          </motion.div>

          {/* Carte Solution - Orange */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-8"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-orange-500">
              <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2} aria-hidden="true" />
            </div>
            <h3 className="mb-4 font-playfair text-2xl font-bold text-[#1c1917]">
              La Réponse Immédiate
            </h3>
            <p className="font-outfit leading-relaxed text-[#44403c]">
              Il est identifié en 2 secondes. Le médecin accède à ses allergies. Vous recevez son emplacement GPS instantanément.{' '}
              <span className="font-semibold text-orange-700">Le silence est brisé.</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
