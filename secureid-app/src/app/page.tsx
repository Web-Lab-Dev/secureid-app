'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Heart, Radio, User, Phone, CloudOff, ShieldCheck, GraduationCap, Star, Sparkles, Battery, Droplet, Building2, ChevronLeft, ChevronRight, Mail, Linkedin, Facebook, Github, MessageCircle, ShoppingCart, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import TrustBar from '@/components/landing/TrustBar';
import ProblemSolutionSection from '@/components/landing/ProblemSolutionSection';
import ShieldSection from '@/components/landing/ShieldSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import IASection from '@/components/landing/IASection';

/**
 * PHASE 10 - LANDING PAGE ÉMOTIONNELLE "WARM & SAFE"
 *
 * Direction artistique : Terre & Solaire
 * Copywriting : Parental, rassurant, sans jargon technique
 * Animations : Framer Motion fluides, scrollytelling
 *
 * SEO: Metadata définis dans layout.tsx parent
 */

/**
 * PHASE 12 - Composant Carrousel Témoignages
 */
interface Testimonial {
  id: string;
  name: string;
  city: string;
  quote: string;
  bgColor: 'amber' | 'orange' | 'rose';
}

/**
 * Composant Modal Formulaire Partenaire
 */
function PartnershipModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    etablissement: '',
    type: 'ecole',
    responsable: '',
    email: '',
    telephone: '',
    ville: '',
    nombreEleves: '',
    message: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Envoyer les données au backend
    console.log('Form submitted:', formData);
    alert('Merci ! Nous vous contacterons rapidement.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl"
      >
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-stone-100"
          aria-label="Fermer"
        >
          <X className="h-6 w-6 text-stone-600" />
        </button>

        {/* Titre */}
        <h2 className="mb-6 font-playfair text-3xl font-bold text-[#1c1917]">
          Devenir École Partenaire
        </h2>
        <p className="mb-8 font-outfit text-stone-600">
          Rejoignez le réseau Safe Zone et sécurisez les sorties de votre établissement.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Nom Établissement */}
            <div>
              <label className="mb-2 block font-outfit text-sm font-semibold text-stone-700">
                Nom de l'établissement *
              </label>
              <input
                type="text"
                required
                value={formData.etablissement}
                onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-4 py-3 font-outfit focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block font-outfit text-sm font-semibold text-stone-700">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-4 py-3 font-outfit focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="ecole">École</option>
                <option value="garderie">Garderie</option>
                <option value="creche">Crèche</option>
              </select>
            </div>

            {/* Nom Responsable */}
            <div>
              <label className="mb-2 block font-outfit text-sm font-semibold text-stone-700">
                Nom du responsable *
              </label>
              <input
                type="text"
                required
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-4 py-3 font-outfit focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block font-outfit text-sm font-semibold text-stone-700">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-4 py-3 font-outfit focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="mb-2 block font-outfit text-sm font-semibold text-stone-700">
                Téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-4 py-3 font-outfit focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Ville */}
            <div>
              <label className="mb-2 block font-outfit text-sm font-semibold text-stone-700">
                Ville *
              </label>
              <input
                type="text"
                required
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-4 py-3 font-outfit focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Nombre d'élèves */}
            <div className="md:col-span-2">
              <label className="mb-2 block font-outfit text-sm font-semibold text-stone-700">
                Nombre d'élèves approximatif
              </label>
              <input
                type="number"
                value={formData.nombreEleves}
                onChange={(e) => setFormData({ ...formData, nombreEleves: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-4 py-3 font-outfit focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <label className="mb-2 block font-outfit text-sm font-semibold text-stone-700">
                Message (optionnel)
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-4 py-3 font-outfit focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-4 font-outfit text-lg font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/50"
          >
            Envoyer la demande
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/**
 * PHASE 13 - Composant Phone Mockup (iPhone Style)
 */
interface PhoneMockupProps {
  src: string;
  alt: string;
  className?: string;
  floatAnimation?: boolean;
  priority?: boolean;
}

function PhoneMockup({ src, alt, className = '', floatAnimation = false, priority = false }: PhoneMockupProps) {
  return (
    <motion.div
      animate={
        floatAnimation
          ? {
              y: [0, -15, 0],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : undefined
      }
      className={`relative ${className}`}
    >
      {/* iPhone Mockup Frame */}
      <div className="relative overflow-hidden rounded-[3rem] border-[12px] border-gray-900 bg-gray-900 shadow-2xl shadow-black/40">
        {/* Notch iPhone */}
        <div className="absolute left-1/2 top-0 z-10 h-7 w-40 -translate-x-1/2 rounded-b-3xl bg-gray-900" />

        {/* Screenshot */}
        <div className="relative aspect-[9/19.5] overflow-hidden bg-white">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 80vw, 400px"
            priority={priority}
          />
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute -inset-4 -z-10 rounded-[4rem] bg-gradient-to-b from-blue-500/10 to-purple-500/10 blur-2xl opacity-50" />
    </motion.div>
  );
}

/**
 * PHASE 13 - Section Dashboard Carrousel
 */
function DashboardCarouselSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const dashboardSlides = useMemo(() => [
    {
      src: '/landing/showcase/dashboard/dashboard-home.jpg',
      alt: 'Accueil Dashboard - Vue d\'ensemble',
      title: 'Vue d\'ensemble',
      description: 'Tous vos enfants, en un coup d\'œil',
    },
    {
      src: '/landing/showcase/dashboard/dashboard-profile.jpg',
      alt: 'Profil Enfant - Données médicales',
      title: 'Profil complet',
      description: 'Allergies, médicaments, contacts d\'urgence',
    },
    {
      src: '/landing/showcase/dashboard/rescue-medical.jpg',
      alt: 'Vue Secouriste - Interface médicale',
      title: 'Vue Médecin',
      description: 'Accès immédiat aux données vitales',
    },
    {
      src: '/landing/showcase/dashboard/rescue-school.jpg',
      alt: 'Vue École - Gestion scolaire',
      title: 'Vue École',
      description: 'Vérification sécurisée à la sortie',
    },
    {
      src: '/landing/showcase/dashboard/dashboard-home (2).jpg',
      alt: 'Dashboard - Carte d\'identité enfant',
      title: 'Sa propre carte d\'identité',
      description: 'Il n\'est plus un inconnu. Chaque enfant a son identité numérique sécurisée.',
    },
  ], []);

  // Auto-scroll toutes les 4 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dashboardSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [dashboardSlides.length]);

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + dashboardSlides.length) % dashboardSlides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % dashboardSlides.length);
  };

  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-b from-stone-50 to-white px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Texte Gauche */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2"
            >
              <Sparkles className="h-5 w-5 text-orange-600" aria-hidden="true" />
              <span className="font-outfit text-sm font-semibold text-orange-700">
                Application Parent
              </span>
            </motion.div>

            {/* Titre */}
            <h2 className="mb-6 font-playfair text-4xl font-bold text-[#1c1917] sm:text-5xl lg:text-6xl">
              Veillez sur eux,{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                d'un simple regard.
              </span>
            </h2>

            {/* Sous-titre */}
            <p className="mb-10 font-outfit text-lg leading-relaxed text-[#57534e] sm:text-xl">
              Ajoutez une allergie, validez une nounou ou consultez un vaccin. Vous avez le super-pouvoir de tout gérer depuis votre poche.
            </p>

            {/* Arguments Clés */}
            <div className="space-y-6">
              {/* Argument 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100">
                  <User className="h-6 w-6 text-orange-600" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="mb-1 font-outfit font-semibold text-[#1c1917]">
                    Toute la famille, réunie.
                  </h4>
                  <p className="font-outfit text-sm text-[#57534e]">
                    Hamadou, Malick, Emilie... Chaque enfant a sa carte, sa photo et ses protections spécifiques. Ajoutez un nouveau bracelet en 3 secondes.
                  </p>
                </div>
              </motion.div>

              {/* Argument 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Radio className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="mb-1 font-outfit font-semibold text-[#1c1917]">
                    Une modification ? C'est immédiat.
                  </h4>
                  <p className="font-outfit text-sm text-[#57534e]">
                    Une nouvelle allergie découverte ? Mettez à jour sa fiche. La seconde d'après, le bracelet est à jour. Pas besoin d'en racheter un.
                  </p>
                </div>
              </motion.div>

              {/* Argument 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100">
                  <ShieldCheck className="h-6 w-6 text-purple-600" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="mb-1 font-outfit font-semibold text-[#1c1917]">
                    Vos secrets sont bien gardés.
                  </h4>
                  <p className="font-outfit text-sm text-[#57534e]">
                    Vous seul détenez les clés (Codes PIN) pour ouvrir le carnet de santé ou valider les sorties d'école. C'est votre jardin secret.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Carrousel Phone Mockup Droite */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-sm lg:max-w-md"
          >
            {/* Phone Mockup statique avec carrousel interne */}
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* iPhone Mockup Frame */}
              <div className="relative overflow-hidden rounded-[3rem] border-[12px] border-gray-900 bg-gray-900 shadow-2xl shadow-black/40">
                {/* Notch iPhone */}
                <div className="absolute left-1/2 top-0 z-10 h-7 w-40 -translate-x-1/2 rounded-b-3xl bg-gray-900" />

                {/* Carrousel d'images à l'intérieur */}
                <div className="relative aspect-[9/19.5] overflow-hidden bg-white">
                  {/* Titre SecureID en haut à gauche */}
                  <div className="absolute left-4 top-8 z-20 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" aria-hidden="true" />
                    <span className="font-playfair text-lg font-bold text-gray-900">SecureID</span>
                  </div>

                  <AnimatePresence initial={false}>
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={dashboardSlides[currentSlide].src}
                        alt={dashboardSlides[currentSlide].alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80vw, 400px"
                        priority={currentSlide === 0}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Subtle glow effect */}
              <div className="absolute -inset-4 -z-10 rounded-[4rem] bg-gradient-to-b from-blue-500/10 to-purple-500/10 blur-2xl opacity-50" />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 z-30 -translate-x-12 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition hover:bg-orange-50 hover:shadow-xl"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-6 w-6 text-orange-600" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 z-30 -translate-y-1/2 translate-x-12 rounded-full bg-white p-3 shadow-lg transition hover:bg-orange-50 hover:shadow-xl"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-6 w-6 text-orange-600" />
              </button>

              {/* Badge flottant "Nouveau" */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, type: 'spring' }}
                className="absolute -right-4 top-12 z-40 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 font-outfit text-sm font-bold text-white shadow-lg"
              >
                ✨ Nouveau
              </motion.div>
            </motion.div>

            {/* Titre Slide Dynamique */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${currentSlide}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-8 text-center"
              >
                <h4 className="mb-2 font-outfit text-xl font-bold text-[#1c1917]">
                  {dashboardSlides[currentSlide].title}
                </h4>
                <p className="font-outfit text-sm text-[#57534e]">
                  {dashboardSlides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Indicateurs de slide */}
            <div className="mt-6 flex justify-center gap-2">
              {dashboardSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-orange-600'
                      : 'w-2 bg-orange-300 hover:bg-orange-400'
                  }`}
                  aria-label={`Aller à la slide ${index + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute right-0 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-orange-200/20 blur-3xl" />
    </section>
  );
}

const testimonials: Testimonial[] = [
  {
    id: 'aminata',
    name: 'Aminata K.',
    city: 'Ouagadougou',
    quote:
      "Maintenant je pars travailler l'esprit tranquille. Je sais que si quelque chose arrive, les informations de mon fils sont là.",
    bgColor: 'amber',
  },
  {
    id: 'ibrahim',
    name: 'Ibrahim S.',
    city: 'Bobo-Dioulasso',
    quote:
      "Le bracelet a sauvé du temps précieux. Les infirmiers ont pu voir ses allergies immédiatement et agir vite.",
    bgColor: 'orange',
  },
];

function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-rotation toutes les 5 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const bgColorClasses = {
    amber: 'bg-amber-50',
    orange: 'bg-orange-50',
    rose: 'bg-rose-50',
  };

  const iconBgClasses = {
    amber: 'bg-amber-200',
    orange: 'bg-orange-200',
    rose: 'bg-rose-200',
  };

  const iconTextClasses = {
    amber: 'text-amber-700',
    orange: 'text-orange-700',
    rose: 'text-rose-700',
  };

  const currentTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <section className="relative z-10 bg-white px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center font-playfair text-3xl font-bold text-[#1c1917] sm:text-4xl"
        >
          Ils nous font confiance
        </motion.h2>

        {/* Carrousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 z-10 -translate-x-12 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 sm:-translate-x-16"
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="h-6 w-6 text-stone-700" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-12 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 sm:translate-x-16"
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="h-6 w-6 text-stone-700" />
          </button>

          {/* Testimonials Slider */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className={`rounded-2xl ${bgColorClasses[currentTestimonial.bgColor]} p-8 sm:p-12`}
              >
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBgClasses[currentTestimonial.bgColor]}`}
                  >
                    <User
                      className={`h-7 w-7 ${iconTextClasses[currentTestimonial.bgColor]}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="font-outfit font-semibold text-[#1c1917]">
                      {currentTestimonial.name}
                    </p>
                    <p className="font-outfit text-sm text-[#78716c]">
                      {currentTestimonial.city}
                    </p>
                  </div>
                </div>
                <p className="font-outfit text-lg italic leading-relaxed text-[#44403c] sm:text-xl">
                  "{currentTestimonial.quote}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicateurs de pagination */}
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-orange-500'
                    : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Aller au témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  // État modal partenaire
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <>
      <PartnershipModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} />
    <div className="overflow-x-hidden bg-[#FAFAF9]">
      <HeroSection />
      <TrustBar />
      <ProblemSolutionSection />

      {/* PHASE 13 - SHOWCASE 1: DASHBOARD PARENT (Carrousel Auto-Défilant) */}
      <DashboardCarouselSection />

      <ShieldSection />
      <FeaturesSection />
      <IASection />

      {/* PHASE 13 - SHOWCASE 2: PORTAIL SECOURISTE */}
      <section className="relative z-10 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl">
          {/* En-tête Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 backdrop-blur-sm">
              <Heart className="h-5 w-5 text-red-400" aria-hidden="true" />
              <span className="font-outfit text-sm font-semibold text-red-300">Interface Secouriste</span>
            </div>

            {/* Titre */}
            <h2 className="mb-6 font-playfair text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Conçu pour{' '}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                l'efficacité absolue.
              </span>
            </h2>

            {/* Sous-titre */}
            <p className="mx-auto max-w-3xl font-outfit text-lg leading-relaxed text-slate-300 sm:text-xl">
              Aucune friction. Aucune application à installer pour le secouriste.{' '}
              <span className="font-semibold text-white">Juste l'essentiel.</span>
            </p>
          </motion.div>

          {/* 3 Phones Overlap */}
          <div className="relative mx-auto max-w-5xl">
            <div className="flex items-center justify-center gap-4 md:gap-0">
              {/* Phone 1 - Gauche (Alerte) */}
              <motion.div
                initial={{ opacity: 0, x: -100, rotateY: -15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 w-64 md:w-80 md:-mr-16"
                style={{ perspective: '1000px' }}
              >
                <PhoneMockup
                  src="/landing/showcase/secouriste page/secouriste acceuil.jpg"
                  alt="Alerte Vitale Secouriste"
                  className="rotate-[-5deg] transform"
                />
                {/* Label */}
                <div className="mt-4 text-center">
                  <p className="font-outfit text-sm font-semibold text-red-400">Alerte Vitale</p>
                  <p className="font-outfit text-xs text-slate-400">Infos médicales en 2s</p>
                </div>
              </motion.div>

              {/* Phone 2 - Centre (IA Assistance) - Plus grand */}
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative z-20 w-72 md:w-96"
              >
                <PhoneMockup
                  src="/landing/showcase/secouriste page/secouriste ia.jpg"
                  alt="IA Assistance Médicale"
                  floatAnimation
                  priority
                />
                {/* Badge "Certifié" */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, type: 'spring' }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 font-outfit text-sm font-bold text-white shadow-lg"
                >
                  🏥 Validé Médical
                </motion.div>
                {/* Label */}
                <div className="mt-4 text-center">
                  <p className="font-outfit text-sm font-semibold text-emerald-400">IA Bienveillante</p>
                  <p className="font-outfit text-xs text-slate-400">Gestes vitaux guidés</p>
                </div>
              </motion.div>

              {/* Phone 3 - Droite (GPS) */}
              <motion.div
                initial={{ opacity: 0, x: 100, rotateY: 15 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative z-10 w-64 md:w-80 md:-ml-16"
                style={{ perspective: '1000px' }}
              >
                <PhoneMockup
                  src="/landing/showcase/secouriste page/send position.jpg"
                  alt="GPS et WhatsApp Parents"
                  className="rotate-[5deg] transform"
                />
                {/* Label */}
                <div className="mt-4 text-center">
                  <p className="font-outfit text-sm font-semibold text-blue-400">GPS WhatsApp</p>
                  <p className="font-outfit text-xs text-slate-400">Contact immédiat</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-20 grid gap-8 sm:grid-cols-3"
          >
            {/* Stat 1 */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center backdrop-blur-sm">
              <p className="mb-2 font-playfair text-4xl font-bold text-orange-400">{'<2s'}</p>
              <p className="font-outfit text-sm text-slate-300">Temps de réponse moyen</p>
            </div>

            {/* Stat 2 */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center backdrop-blur-sm">
              <p className="mb-2 font-playfair text-4xl font-bold text-emerald-400">100%</p>
              <p className="font-outfit text-sm text-slate-300">Sans installation</p>
            </div>

            {/* Stat 3 */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center backdrop-blur-sm">
              <p className="mb-2 font-playfair text-4xl font-bold text-blue-400">500+</p>
              <p className="font-outfit text-sm text-slate-300">Familles protégées</p>
            </div>
          </motion.div>
        </div>

        {/* Background effects */}
        <div className="absolute left-0 top-1/4 -z-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </section>

      {/* INSERTION C: DÉMO PRODUIT "L'ARMURE INVISIBLE" */}
      <section className="relative z-10 bg-stone-900 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-playfair text-4xl font-bold text-white sm:text-5xl">
              Conçu pour{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                la vraie vie.
              </span>
            </h2>
            <p className="mt-4 font-outfit text-lg text-stone-300 sm:text-xl">
              Pas de batterie. Pas d'ondes. 100% Étanche. Indestructible.
            </p>
          </motion.div>

          {/* Vidéo Démo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="relative mb-16 aspect-video overflow-hidden rounded-3xl shadow-2xl shadow-orange-500/20"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            >
              <source src="/landing/product-demo.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo HTML5.
            </video>
            {/* Overlay subtil pour masquer le logo Gemini en bas à droite */}
            <div className="absolute bottom-0 right-0 h-[50px] w-[80px] bg-gradient-to-tl from-stone-900/90 via-stone-900/50 to-transparent" />
          </motion.div>

          {/* Grid Features */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1: Pas de Batterie */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
                <Battery className="h-8 w-8 text-orange-400" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
                0% Batterie requise
              </h3>
              <p className="font-outfit text-stone-400">
                Aucune recharge nécessaire. Il protège jour et nuit, sans jamais s'éteindre.
              </p>
            </motion.div>

            {/* Feature 2: Étanche */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                <Droplet className="h-8 w-8 text-blue-400" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
                100% Étanche
              </h3>
              <p className="font-outfit text-stone-400">
                Il résiste à la boue, à la pluie et aux récréations les plus mouvementées.
              </p>
            </motion.div>

            {/* Feature 3: Indestructible */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Shield className="h-8 w-8 text-emerald-400" strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-outfit text-xl font-semibold text-white">
                Matériaux Hypoallergéniques
              </h3>
              <p className="font-outfit text-stone-400">
                Conçu avec des matériaux certifiés, doux pour la peau. Indestructible.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TÉMOIGNAGES - PHASE 12 CARROUSEL */}
      <TestimonialsCarousel />

      {/* SECTION 5: CTA FINAL */}
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
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-4 font-outfit text-base font-semibold text-white shadow-2xl shadow-orange-500/50 transition-all hover:scale-105 hover:shadow-orange-500/70"
            >
              <Shield className="h-5 w-5" aria-hidden="true" />
              Activer sa protection maintenant
            </Link>
          </motion.div>
        </div>
      </section>

      {/* INSERTION D: PARTENARIAT ÉCOLE */}
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
              onClick={() => setIsPartnerModalOpen(true)}
              className="group inline-flex items-center gap-2 font-outfit text-lg font-semibold text-orange-700 underline decoration-2 underline-offset-4 transition-colors hover:text-orange-800"
            >
              Devenir École Partenaire
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-stone-200 bg-[#FAFAF9] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Colonne 1: Logo et description */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-8 w-8 text-amber-600" strokeWidth={2} aria-hidden="true" />
                <span className="font-playfair text-2xl font-bold text-[#1c1917]">SecureID</span>
              </div>
              <p className="font-outfit text-sm leading-relaxed text-[#78716c]">
                Protégez ce qui compte le plus. Un lien invisible qui veille sur vos enfants.
              </p>
            </div>

            {/* Colonne 2: Liens */}
            <div>
              <h3 className="mb-4 font-outfit font-semibold text-[#1c1917]">Informations</h3>
              <ul className="space-y-2 font-outfit text-sm text-[#78716c]">
                <li>
                  <Link href="/login" className="hover:text-amber-600 transition-colors">
                    Activer un bracelet
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-amber-600 transition-colors">
                    Se connecter
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-600 transition-colors">
                    À propos
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonne 3: Contact */}
            <div>
              <h3 className="mb-4 font-outfit font-semibold text-[#1c1917]">Contact</h3>
              <p className="mb-4 font-outfit text-sm font-semibold text-[#1c1917]">
                +226 77 04 04 92 / 72 98 25 02
              </p>

              {/* Logos sociaux avec couleurs de marque */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Téléphone */}
                <a
                  href="tel:+22677040492"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition-all hover:bg-orange-600 hover:scale-110"
                  aria-label="Appeler +226 77 04 04 92"
                  title="Appel"
                >
                  <Phone className="h-5 w-5" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/22677040492"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-all hover:bg-[#20BD5A] hover:scale-110"
                  aria-label="WhatsApp +226 77 04 04 92"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>

                {/* Email */}
                <a
                  href="mailto:tko364796@gmail.com"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EA4335] text-white transition-all hover:bg-[#D33426] hover:scale-110"
                  aria-label="Email tko364796@gmail.com"
                  title="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/swabo-hamadou-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0077B5] text-white transition-all hover:bg-[#006399] hover:scale-110"
                  aria-label="LinkedIn Swabo Hamadou"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>

                {/* Facebook */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition-all hover:bg-[#1565D8] hover:scale-110"
                  aria-label="Facebook SecureID"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>

                {/* GitHub */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#181717] text-white transition-all hover:bg-black hover:scale-110"
                  aria-label="GitHub SecureID"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 border-t border-stone-200 pt-8 text-center">
            <p className="font-outfit text-sm text-[#a8a29e]">
              © {new Date().getFullYear()} SecureID. Protégez ce qui compte le plus.
            </p>
          </div>
        </div>
      </footer>

      {/* STICKY BOTTOM BAR (Mobile) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/20 bg-white/80 p-4 backdrop-blur-lg sm:hidden"
      >
        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 py-3 font-outfit font-semibold text-white shadow-lg shadow-orange-500/30"
        >
          <Shield className="h-5 w-5" aria-hidden="true" />
          ACTIVER SA PROTECTION
        </Link>
      </motion.div>
    </div>
    </>
  );
}
