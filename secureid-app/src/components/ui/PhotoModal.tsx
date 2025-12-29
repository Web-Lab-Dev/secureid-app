'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal pour afficher une photo en grand format
 * Utilisé pour faciliter l'identification visuelle de l'enfant
 *
 * Utilise React Portal pour rendre le modal directement dans le body
 * et éviter les problèmes de z-index avec les stacking contexts parents
 */

interface PhotoModalProps {
  /** URL de la photo */
  photoUrl: string;
  /** Nom de l'enfant */
  childName: string;
  /** État d'ouverture */
  isOpen: boolean;
  /** Fonction pour fermer le modal */
  onClose: () => void;
}

export function PhotoModal({ photoUrl, childName, isOpen, onClose }: PhotoModalProps) {
  const [mounted, setMounted] = useState(false);

  // Attendre que le composant soit monté côté client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Bloquer le scroll quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      {/* Container du modal */}
      <div
        className="relative max-h-[90vh] max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Photo de {childName}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Photo en grand format */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-800">
          <Image
            src={photoUrl}
            alt={`Photo de ${childName}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>

        {/* Aide */}
        <p className="mt-4 text-center text-sm text-slate-400">
          Cliquez en dehors ou appuyez sur Échap pour fermer
        </p>
      </div>
    </div>
  );

  // Utiliser createPortal pour rendre le modal directement dans le body
  return createPortal(modalContent, document.body);
}
