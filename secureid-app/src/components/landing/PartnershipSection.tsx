'use client';

import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

interface PartnershipSectionProps {
  onOpenModal: () => void;
}

export default function PartnershipSection({ onOpenModal }: PartnershipSectionProps) {
  return (
    <section className="relative z-10 bg-white px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl border-l-4 border-orange-500 bg-orange-50/50 p-8 md:p-12"
        >
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2">
            <Building2 className="h-5 w-5 text-orange-600" aria-hidden="true" />
            <span className="font-outfit text-sm font-semibold text-orange-700">
              Établissements & Garderies
            </span>
          </div>

          {/* Titre */}
          <h2 className="mb-4 font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl">
            Directeurs d'Établissement & Garderies
          </h2>

          {/* Description */}
          <p className="mb-6 font-outfit text-lg leading-relaxed text-[#44403c]">
            La sécurité de vos élèves est votre priorité ? Rejoignez le réseau{' '}
            <span className="font-semibold text-orange-700">'Safe Zone'</span>.{' '}
            Sécurisez les sorties et rassurez vos parents.
          </p>

          {/* CTA Secondaire */}
          <button
            onClick={onOpenModal}
            className="group inline-flex items-center gap-2 font-outfit text-lg font-semibold text-orange-700 underline decoration-2 underline-offset-4 transition-colors hover:text-orange-800"
          >
            Devenir École Partenaire
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
