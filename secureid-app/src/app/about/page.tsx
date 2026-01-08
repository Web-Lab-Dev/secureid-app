'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Shield, Lock, Zap, Heart, Users, MapPin, Quote } from 'lucide-react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden bg-[#FAFAF9]">
      <Header />

      {/* SECTION 1 : HERO - LA MISSION */}
      <section className="relative px-4 pb-20 pt-32 sm:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-playfair text-4xl font-bold text-[#1c1917] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Plus qu'un bracelet,{' '}
            <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              un lien de sécurité vital
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-8 max-w-3xl font-outfit text-lg text-[#57534e] sm:text-xl"
          >
            Notre mission est simple : offrir aux enfants la liberté de grandir et aux parents la
            sérénité d'esprit. Nous utilisons la technologie pour faciliter l'intervention des
            secours et sécuriser le quotidien, de l'école aux vacances.
          </motion.p>
        </div>
      </section>

      {/* SECTION 2 : LE MUR DU RÉEL (LE CHOC & LES STATS) */}
      <section className="relative bg-stone-900 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-playfair text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Ce que nous voyons tous{' '}
              <span className="text-orange-400">chaque jour</span>.
            </h2>

            {/* Carrousel de placeholders */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-stone-600 bg-stone-800"
                >
                  <div className="text-center">
                    <Image
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E"
                      alt="Screenshot placeholder"
                      width={64}
                      height={64}
                      className="mx-auto opacity-50"
                    />
                    <p className="mt-4 font-outfit text-sm text-stone-500">
                      Screenshot Facebook/WhatsApp #{item}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Texte d'accompagnement */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12"
            >
              <p className="mx-auto max-w-3xl font-outfit text-lg leading-relaxed text-stone-300 sm:text-xl">
                "Aidez-nous à retrouver les parents", "Enfant égaré au marché"... Nos fils
                d'actualité sont inondés d'avis de recherche. Au Burkina Faso et en Afrique de
                l'Ouest, les incidents graves touchant les enfants ont{' '}
                <span className="font-bold text-orange-400">
                  augmenté de 70% ces 4 dernières années
                </span>{' '}
                (UNICEF).
              </p>
              <p className="mx-auto mt-6 max-w-3xl font-outfit text-lg leading-relaxed text-stone-300 sm:text-xl">
                Ce qui n'est qu'une notification sur votre téléphone peut devenir{' '}
                <span className="font-bold text-white">votre pire cauchemar</span> en une seconde
                d'inattention.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 : L'HISTOIRE (NÉ D'UN BESOIN DE PROTECTION) */}
      <section className="relative bg-white px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Texte */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl md:text-5xl">
                Parler pour ceux qui{' '}
                <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                  ne le peuvent pas
                </span>
                .
              </h2>

              <p className="mt-8 font-outfit text-lg leading-relaxed text-[#57534e]">
                En voyant la difficulté pour les secouristes d'identifier rapidement un enfant
                perdu ou en malaise, j'ai décidé de créer une solution qui parle pour eux quand
                ils ne le peuvent pas.
              </p>

              <p className="mt-6 font-outfit text-lg leading-relaxed text-[#57534e]">
                Là où l'humain panique,{' '}
                <span className="font-semibold text-orange-600">le code apporte une réponse immédiate</span>.
              </p>
            </motion.div>

            {/* Image/Illustration placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex h-96 items-center justify-center rounded-3xl border-2 border-dashed border-stone-300 bg-stone-50"
            >
              <div className="text-center">
                <Heart className="mx-auto h-16 w-16 text-orange-400" />
                <p className="mt-4 font-outfit text-sm text-stone-500">
                  Illustration - Protection enfant
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4 : LE FONDATEUR (PROFIL TECH & HUMAIN) */}
      <section className="relative bg-amber-50 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl md:text-5xl">
              Qui porte le projet ?
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 rounded-3xl bg-white p-8 shadow-xl shadow-orange-100 sm:p-12"
          >
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
              {/* Photo placeholder */}
              <div className="flex h-48 w-48 flex-shrink-0 items-center justify-center rounded-full border-4 border-orange-200 bg-gradient-to-br from-orange-100 to-amber-100">
                <Users className="h-20 w-20 text-orange-500" />
              </div>

              {/* Bio */}
              <div className="flex-1">
                <p className="font-outfit text-lg leading-relaxed text-[#57534e]">
                  "Je m'appelle <span className="font-semibold text-[#1c1917]">[Ton Nom]</span>.
                  Développeur web, expert en IA et automatisation, j'ai développé cette solution
                  en partant d'une page blanche pour garantir une sécurité totale. Aujourd'hui, je
                  travaille en direct avec les premiers parents utilisateurs pour faire évoluer ce
                  bracelet selon vos besoins réels.
                </p>
                <p className="mt-6 font-outfit text-lg leading-relaxed text-[#57534e]">
                  Ce n'est pas qu'un projet technique,{' '}
                  <span className="font-semibold text-orange-600">
                    c'est mon engagement pour notre communauté
                  </span>
                  ."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 : NOS ENGAGEMENTS (LA CONFIANCE TECHNIQUE) */}
      <section className="relative bg-white px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl md:text-5xl">
              Nos{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                Engagements
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-outfit text-lg text-[#57534e]">
              La confiance technique au service de votre tranquillité
            </p>
          </motion.div>

          {/* Grid 3 colonnes */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Bloc A : Simplicité */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group rounded-3xl bg-white p-8 shadow-xl shadow-orange-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-200"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-6 font-playfair text-2xl font-bold text-[#1c1917]">
                Simplicité
              </h3>
              <p className="mt-4 font-outfit text-[#57534e] leading-relaxed">
                Un scan suffit pour sauver une vie. Pas d'application complexe pour le secouriste.
              </p>
            </motion.div>

            {/* Bloc B : Confidentialité */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group rounded-3xl bg-white p-8 shadow-xl shadow-blue-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-200"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-6 font-playfair text-2xl font-bold text-[#1c1917]">
                Confidentialité
              </h3>
              <p className="mt-4 font-outfit text-[#57534e] leading-relaxed">
                Vous gardez le contrôle total. Vous décidez quelles informations sont visibles et
                qui est autorisé à récupérer votre enfant.
              </p>
            </motion.div>

            {/* Bloc C : Innovation utile */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group rounded-3xl bg-white p-8 shadow-xl shadow-purple-100 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-200 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-6 font-playfair text-2xl font-bold text-[#1c1917]">
                Innovation utile
              </h3>
              <p className="mt-4 font-outfit text-[#57534e] leading-relaxed">
                Pas de gadgets. Juste l'essentiel : Carnet de santé numérique, géolocalisation et
                contacts d'urgence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6 : LA PREUVE SOCIALE (EXPERTISE TERRAIN) */}
      <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl bg-white p-8 shadow-2xl sm:p-12"
          >
            {/* Guillemet décoratif */}
            <Quote className="absolute -left-4 -top-4 h-16 w-16 text-blue-200" />

            <blockquote className="relative">
              <p className="font-outfit text-xl leading-relaxed text-[#1c1917] sm:text-2xl">
                "Un outil qui donne immédiatement le groupe sanguin et les contacts parents fait
                gagner de{' '}
                <span className="font-bold text-blue-600">précieuses minutes</span>."
              </p>

              <footer className="mt-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#1c1917]">Marc</p>
                  <p className="text-sm text-[#57534e]">Secouriste</p>
                </div>
              </footer>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7 : APPEL À L'ACTION (CTA) */}
      <section className="relative bg-gradient-to-br from-orange-500 to-amber-600 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-playfair text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Rejoignez les premiers parents qui nous font confiance
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-outfit text-lg text-orange-50 sm:text-xl">
              Aidez-nous à sécuriser l'avenir de nos enfants
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-10"
            >
              <Link href="/activate">
                <Button
                  size="lg"
                  className="bg-white font-outfit text-lg font-semibold text-orange-600 shadow-2xl transition-all hover:scale-105 hover:bg-orange-50 hover:shadow-orange-900/50"
                  rounded="full"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Devenir Parent Testeur
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
