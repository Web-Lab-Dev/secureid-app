'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Bell, Shield, Clock, Navigation } from 'lucide-react';

/**
 * SECTION GEOFENCING / SUIVI TEMPS RÉEL
 *
 * Objectif: Montrer la solution proactive de tracking GPS avec zones sécurisées
 * Réponse émotionnelle: Soulagement après le choc des vidéos TikTok parents
 *
 * Positionnement: Après ParentTestimonialsTikTokSection, AVANT SecoursiteSection
 * Impact psychologique: Peur → Contrôle, Empowerment parental
 */

export default function GeofencingSection() {
  const features = [
    {
      icon: MapPin,
      color: 'indigo',
      title: 'Zones illimitées',
      description: 'Dessinez ses espaces autorisés sur la carte. École, maison, parc, crèche...',
    },
    {
      icon: Bell,
      color: 'blue',
      title: 'Alertes temps réel',
      description: 'Notification immédiate dès qu\'il franchit une limite. Vous savez tout de suite.',
    },
    {
      icon: Clock,
      color: 'purple',
      title: 'Historique 30 jours',
      description: 'Suivez ses déplacements passés. Comprenez ses habitudes de circulation.',
    },
  ];

  const stats = [
    { value: '97%', label: 'Parents plus sereins' },
    { value: '<3s', label: 'Délai d\'alerte' },
    { value: '∞', label: 'Zones configurables' },
  ];

  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 px-4 py-20 sm:py-32">
      {/* Background effects */}
      <div className="absolute left-0 top-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2">
            <Shield className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <span className="font-outfit text-sm font-semibold text-indigo-700">
              Protection Proactive
            </span>
          </div>

          {/* Titre Principal */}
          <h2 className="mb-6 font-playfair text-4xl font-bold text-slate-900 sm:text-5xl lg:text-6xl">
            Il ne peut{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              plus se perdre
            </span>
          </h2>

          {/* Sous-titre */}
          <p className="mx-auto max-w-3xl font-outfit text-lg leading-relaxed text-slate-600 sm:text-xl">
            Vous créez des zones de sécurité. École, maison, parc...{' '}
            <span className="font-semibold text-slate-900">
              Dès qu'il franchit la limite, vous savez. Instantanément.
            </span>
          </p>
        </motion.div>

        {/* Contenu Principal - Split 50/50 */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gauche: Features texte */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Features List */}
            <div className="space-y-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const colorClasses = {
                  indigo: 'bg-indigo-100 text-indigo-600',
                  blue: 'bg-blue-100 text-blue-600',
                  purple: 'bg-purple-100 text-purple-600',
                };

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="flex items-start gap-4"
                  >
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                        colorClasses[feature.color as keyof typeof colorClasses]
                      }`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="mb-1 font-outfit font-semibold text-slate-900">
                        {feature.title}
                      </h4>
                      <p className="font-outfit text-sm text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA Visuel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-10 rounded-2xl border border-indigo-200 bg-white/80 p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <Navigation className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="font-outfit text-sm font-semibold text-slate-900">
                    Configuration en 2 minutes
                  </p>
                  <p className="font-outfit text-xs text-slate-600">
                    Depuis votre tableau de bord parent
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Droite: Carte GPS mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Image carte GPS avec zones sécurisées */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-white shadow-2xl shadow-indigo-500/20">
              {/* Carte GPS réelle - Localisation temps réel */}
              <div className="relative aspect-[4/3]">
                <Image
                  src="/landing/geofencing-map.jpeg"
                  alt="Carte GPS Ouagadougou avec zones de sécurité configurées - Suivi temps réel"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />

                {/* Overlay pour masquer navbar centrale (barre fixe au milieu de la capture) */}
                <div className="absolute left-0 right-0 top-[45%] h-[10%] bg-gradient-to-b from-indigo-100/0 via-indigo-50/90 to-indigo-100/0 backdrop-blur-sm pointer-events-none" />
              </div>

              {/* Badge alerte simulée */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, type: 'spring' }}
                className="absolute right-4 top-4 rounded-full bg-red-500 px-4 py-2 font-outfit text-sm font-bold text-white shadow-lg"
              >
                🚨 Zone franchie !
              </motion.div>
            </div>

            {/* Phone mockup avec notification (optionnel) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-6 -left-6 rounded-2xl border-4 border-white bg-slate-900 p-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-orange-400" />
                <div>
                  <p className="font-outfit text-xs font-semibold text-white">
                    Notification reçue
                  </p>
                  <p className="font-outfit text-[10px] text-slate-400">
                    Il y a 2 secondes
                  </p>
                </div>
              </div>
              <p className="mt-2 font-outfit text-xs text-slate-300">
                Hamadou a quitté la zone École
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid gap-8 sm:grid-cols-3"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="rounded-2xl border border-indigo-200 bg-white/60 p-6 text-center backdrop-blur-sm"
            >
              <p className="mb-2 font-playfair text-4xl font-bold text-indigo-600">
                {stat.value}
              </p>
              <p className="font-outfit text-sm text-slate-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Message rassurant final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="font-outfit text-lg text-slate-700">
            Parce que savoir où il est,{' '}
            <span className="font-semibold text-indigo-600">
              c'est déjà le protéger.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
