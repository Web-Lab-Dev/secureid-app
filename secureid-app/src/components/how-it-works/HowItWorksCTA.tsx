'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowItWorksCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-2xl shadow-orange-500/30"
        >
          <Shield className="h-10 w-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-playfair text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
        >
          Prêt à protéger{' '}
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            votre enfant ?
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl font-outfit text-lg text-gray-300"
        >
          Rejoignez des milliers de parents qui font confiance à SecureID pour la sécurité de leurs enfants.
          Activation simple, protection immédiate.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button variant="gradient" size="lg" rounded="full" asChild>
            <Link href="/activate">
              <Shield className="h-5 w-5" aria-hidden="true" />
              Activer mon bracelet
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            rounded="full"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            asChild
          >
            <Link href="/#commander">
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              Commander un bracelet
            </Link>
          </Button>
        </motion.div>

      </div>
    </section>
  );
}
