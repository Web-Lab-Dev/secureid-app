'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActivateUrl } from '@/lib/url-helpers';

export default function CTASection() {
  return (
    <section className="relative z-10 h-[600px] overflow-hidden">
      {/* Parallax Background */}
      <div className="absolute inset-0">
        <Image
          src="/landing/cta-father-hand.webp"
          alt="Main protectrice d'un père"
          fill
          sizes="100vw"
          className="object-cover object-center"
          loading="lazy"
        />
        {/* Dark overlay pour faire ressortir le contenu */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
      </div>

      {/* Contenu CTA */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h2 className="mb-6 font-playfair text-4xl font-bold text-white drop-shadow-2xl sm:text-5xl md:text-6xl">
            Parce qu'un parent ne devrait jamais avoir à chercher son enfant
          </h2>
          <p className="mb-10 font-outfit text-lg leading-relaxed text-white/90 drop-shadow-lg sm:text-xl">
            Rejoignez les centaines de familles burkinabé qui ont choisi la tranquillité.
          </p>
          <Button variant="gradient" size="lg" rounded="full" asChild>
            <Link href={getActivateUrl()}>
              <Shield className="h-5 w-5" aria-hidden="true" />
              Activer sa protection maintenant
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
