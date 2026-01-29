'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

/**
 * AnimatedImage - Image avec chargement animé doux
 *
 * Features:
 * - Placeholder blur/skeleton pendant chargement
 * - Transition douce blur → sharp
 * - Fade-in avec léger scale
 * - Compatible avec Next.js Image optimization
 */

interface AnimatedImageProps extends Omit<ImageProps, 'onLoad'> {
  /** Classe pour le conteneur */
  containerClassName?: string;
  /** Durée de la transition (ms) */
  transitionDuration?: number;
  /** Type d'animation */
  animationType?: 'fade' | 'blur' | 'scale' | 'blur-scale';
}

export function AnimatedImage({
  src,
  alt,
  className,
  containerClassName,
  transitionDuration = 700,
  animationType = 'blur-scale',
  ...props
}: AnimatedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsError(true);
  };

  // Styles selon le type d'animation
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-out';
    const duration = `duration-[${transitionDuration}ms]`;

    switch (animationType) {
      case 'fade':
        return cn(
          baseClasses,
          isLoaded ? 'opacity-100' : 'opacity-0'
        );
      case 'blur':
        return cn(
          baseClasses,
          isLoaded ? 'blur-0 opacity-100' : 'blur-md opacity-50'
        );
      case 'scale':
        return cn(
          baseClasses,
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        );
      case 'blur-scale':
      default:
        return cn(
          baseClasses,
          isLoaded
            ? 'blur-0 opacity-100 scale-100'
            : 'blur-sm opacity-0 scale-[1.02]'
        );
    }
  };

  if (isError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-800/50',
          containerClassName
        )}
      >
        <div className="text-slate-500 text-xs">Erreur</div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Skeleton/Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-700/50 to-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Image avec animation */}
      <Image
        src={src}
        alt={alt}
        className={cn(
          getAnimationClasses(),
          'duration-700',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

/**
 * AnimatedAvatar - Version spéciale pour les photos de profil
 * Cercle avec ring animé au chargement
 */
interface AnimatedAvatarProps extends AnimatedImageProps {
  /** Taille de l'avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Afficher le ring animé */
  showRing?: boolean;
  /** Couleur du ring */
  ringColor?: 'pink' | 'orange' | 'blue' | 'green';
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-28 w-28',
};

const ringSizeClasses = {
  sm: 'ring-2',
  md: 'ring-2',
  lg: 'ring-4',
  xl: 'ring-4',
};

const ringColorClasses = {
  pink: 'ring-soft-pink/30 shadow-soft-pink/20',
  orange: 'ring-brand-orange/30 shadow-brand-orange/20',
  blue: 'ring-trust-blue/30 shadow-trust-blue/20',
  green: 'ring-health-mint/30 shadow-health-mint/20',
};

export function AnimatedAvatar({
  size = 'lg',
  showRing = true,
  ringColor = 'pink',
  containerClassName,
  className,
  ...props
}: AnimatedAvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full',
        sizeClasses[size],
        showRing && [
          ringSizeClasses[size],
          ringColorClasses[ringColor],
          'shadow-lg',
          isLoaded && 'animate-soft-glow',
        ],
        containerClassName
      )}
    >
      {/* Pulse pendant chargement */}
      {!isLoaded && (
        <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-br from-slate-700 to-slate-800">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-slate-600/30 to-transparent animate-spin-slow" />
        </div>
      )}

      <AnimatedImage
        {...props}
        className={cn('h-full w-full object-cover rounded-full', className)}
        containerClassName="h-full w-full"
        animationType="blur-scale"
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
}
