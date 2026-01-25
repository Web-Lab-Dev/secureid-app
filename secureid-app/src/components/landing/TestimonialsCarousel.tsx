'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Testimonial {
  id: string;
  name: string;
  city: string;
  quote: string;
  bgColor: 'amber' | 'orange' | 'rose';
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
  {
    id: 'fatou',
    name: 'Fatou O.',
    city: 'Ouagadougou',
    quote:
      "Mon fils est sorti de l'école sans prévenir. J'ai reçu l'alerte sur mon téléphone immédiatement. En 5 minutes, je savais exactement où il était.",
    bgColor: 'rose',
  },
];

/**
 * Carrousel de témoignages clients
 * Animation fluide avec rotation automatique
 */
export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Auto-rotation toutes les 5 secondes (désactivé si prefers-reduced-motion)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

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
            {testimonials.map((testimonial, index) => (
              <button
                key={`testimonial-${testimonial.id}`}
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

export default TestimonialsCarousel;
