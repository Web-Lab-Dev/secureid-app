'use client';

import { motion } from 'framer-motion';
import { Shield, PlayCircle } from 'lucide-react';

export default function HowItWorksHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white py-20 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2"
          >
            <Shield className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Le parcours SecureID</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl"
          >
            Comment SecureID{' '}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              protège votre enfant
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl font-outfit text-lg text-gray-600 sm:text-xl"
          >
            Un parcours simple en 3 étapes pour activer la protection de votre enfant.
            Scannez, configurez, protégez.
          </motion.p>

          {/* Video teaser */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-10 flex max-w-md items-center justify-center gap-4 rounded-2xl bg-white p-4 shadow-lg shadow-orange-100/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Découvrez en vidéo</p>
              <p className="text-sm text-gray-500">3 scénarios de protection en situation réelle</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
