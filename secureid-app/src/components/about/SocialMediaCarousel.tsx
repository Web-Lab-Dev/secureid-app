'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CARROUSEL D'IMAGES - ANNONCES RÉSEAUX SOCIAUX
 *
 * Carrousel automatique avec pause au survol
 * - Défilement automatique toutes les 4 secondes
 * - Pause quand l'utilisateur survole
 * - Navigation manuelle avec flèches
 * - Indicateurs de position
 */

interface SocialMediaCarouselProps {
  images: string[];
  interval?: number; // Millisecondes entre chaque changement (défaut: 4000ms)
}

export function SocialMediaCarousel({ images, interval = 4000 }: SocialMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Fonction pour passer à l'image suivante
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Fonction pour passer à l'image précédente
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Fonction pour aller à une image spécifique
  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  // Effet pour le défilement automatique
  useEffect(() => {
    resetTimeout();

    if (!isPaused) {
      timeoutRef.current = setTimeout(() => {
        goToNext();
      }, interval);
    }

    return () => {
      resetTimeout();
    };
  }, [currentIndex, isPaused, interval]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Container du carrousel */}
      <div className="relative h-96 overflow-hidden rounded-2xl bg-stone-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`Annonce réseau social ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay gradient pour meilleure lisibilité des contrôles */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-900/50" />

        {/* Bouton Précédent */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl transition-all hover:scale-110 hover:bg-white"
          aria-label="Image précédente"
        >
          <ChevronLeft className="h-6 w-6 text-stone-900" />
        </button>

        {/* Bouton Suivant */}
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl transition-all hover:scale-110 hover:bg-white"
          aria-label="Image suivante"
        >
          <ChevronRight className="h-6 w-6 text-stone-900" />
        </button>

        {/* Indicateurs de position */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-orange-500'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>

        {/* Indicateur de pause */}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-4 top-4 z-10 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg"
          >
            Pause
          </motion.div>
        )}
      </div>

      {/* Compteur d'images */}
      <div className="mt-4 text-center">
        <p className="font-outfit text-sm text-stone-400">
          Image {currentIndex + 1} sur {images.length}
        </p>
      </div>
    </div>
  );
}
