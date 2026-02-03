'use client';

import { motion } from 'framer-motion';
import {
  QrCode,
  Smartphone,
  Shield,
  MapPin,
  Users,
  Heart,
  ArrowRight,
  Check
} from 'lucide-react';

const flowSteps = [
  { icon: QrCode, label: 'Scan QR', color: 'bg-orange-500' },
  { icon: Smartphone, label: 'Activation', color: 'bg-blue-500' },
  { icon: Shield, label: 'Configuration', color: 'bg-indigo-500' },
  { icon: MapPin, label: 'GPS Actif', color: 'bg-green-500' },
  { icon: Users, label: 'Secouriste', color: 'bg-purple-500' },
  { icon: Heart, label: 'Protection', color: 'bg-red-500' },
];

const keyPoints = [
  {
    title: 'Activation Instantanée',
    description: 'Un simple scan suffit pour démarrer la protection',
  },
  {
    title: 'Configuration en 2 minutes',
    description: 'Interface intuitive, aucune compétence technique requise',
  },
  {
    title: 'GPS Temps Réel',
    description: 'Suivez votre enfant où qu\'il soit, 24h/24',
  },
  {
    title: 'Alertes Intelligentes',
    description: 'Notifications dès qu\'il sort d\'une zone sécurisée',
  },
  {
    title: 'Données Médicales',
    description: 'Informations vitales accessibles aux secouristes',
  },
  {
    title: 'Contact Direct',
    description: 'Les secouristes peuvent vous joindre instantanément',
  },
];

export default function FlowDiagram() {
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-playfair text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Le Flux Complet
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl font-outfit text-lg text-gray-600"
          >
            De l'activation à la protection complète, visualisez le parcours SecureID.
          </motion.p>
        </div>

        {/* Flow diagram - horizontal on desktop, vertical on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 overflow-x-auto"
        >
          <div className="flex min-w-max items-center justify-center gap-2 py-8 lg:gap-4">
            {flowSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                {/* Step circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  className="flex flex-col items-center"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} shadow-lg lg:h-16 lg:w-16`}>
                    <step.icon className="h-6 w-6 text-white lg:h-7 lg:w-7" />
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-600 lg:text-sm">
                    {step.label}
                  </span>
                </motion.div>

                {/* Arrow (not after last item) */}
                {index < flowSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.05 }}
                    className="mx-2 lg:mx-4"
                  >
                    <ArrowRight className="h-5 w-5 text-gray-300" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key points grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {keyPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{point.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{point.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
