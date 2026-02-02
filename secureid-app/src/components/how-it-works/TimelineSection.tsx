'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  QrCode,
  Smartphone,
  ShieldCheck,
  UserPlus,
  Settings,
  Download,
  MapPin,
  Navigation,
  ScanLine
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Premier Scan = Activation',
    description: 'Scannez le QR code du bracelet avec votre téléphone pour commencer.',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    details: [
      { icon: QrCode, text: 'Scannez le QR code du bracelet' },
      { icon: Smartphone, text: 'Arrivez sur la page d\'activation' },
      { icon: ShieldCheck, text: 'Cliquez sur "Activer sa protection"' },
    ],
  },
  {
    number: '02',
    title: 'Configuration du Tableau de Bord',
    description: 'Créez votre compte et personnalisez les informations du bracelet.',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    details: [
      { icon: UserPlus, text: 'Créez votre compte parent' },
      { icon: Settings, text: 'Renseignez identité, infos médicales, contacts' },
      { icon: Download, text: 'Installez l\'application PWA' },
    ],
  },
  {
    number: '03',
    title: 'Protection Active',
    description: 'Votre enfant est maintenant protégé. Suivez-le en temps réel.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    details: [
      { icon: MapPin, text: 'Configurez les zones sécurisées' },
      { icon: Navigation, text: 'Suivez la position GPS en temps réel' },
      { icon: ScanLine, text: 'Les scans suivants → Page Secouriste' },
    ],
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`relative rounded-3xl ${step.bgColor} border ${step.borderColor} p-6 lg:p-8`}
    >
      {/* Step number badge */}
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-xl font-bold text-white shadow-lg`}>
        {step.number}
      </div>

      {/* Content */}
      <h3 className="mb-2 font-playfair text-2xl font-bold text-gray-900">
        {step.title}
      </h3>
      <p className="mb-6 font-outfit text-gray-600">
        {step.description}
      </p>

      {/* Details list */}
      <div className="space-y-3">
        {step.details.map((detail, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.2 + i * 0.1 + 0.3 }}
            className="flex items-center gap-3 rounded-xl bg-white/80 p-3 backdrop-blur-sm"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${step.color}`}>
              <detail.icon className="h-4 w-4 text-white" />
            </div>
            <span className="font-outfit text-sm text-gray-700">{detail.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Connector line (not on last item) */}
      {index < steps.length - 1 && (
        <div className="absolute -bottom-8 left-1/2 hidden h-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-gray-300 to-transparent lg:block" />
      )}
    </motion.div>
  );
}

export default function TimelineSection() {
  return (
    <section className="relative bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-playfair text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Le Parcours Bracelet
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl font-outfit text-lg text-gray-600"
          >
            Du premier scan à la protection complète, suivez le parcours en 3 étapes simples.
          </motion.p>
        </div>

        {/* Timeline steps */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Visual flow line for desktop */}
        <div className="mt-8 hidden items-center justify-center gap-4 lg:flex">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <div className="h-0.5 flex-1 bg-gradient-to-r from-orange-300 via-blue-300 to-green-300" />
          <div className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </div>
    </section>
  );
}
