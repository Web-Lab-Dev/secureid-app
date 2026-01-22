'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { logger } from '@/lib/logger';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal Formulaire Partenaire
 * Permet aux écoles/garderies de demander à devenir partenaire
 */
export function PartnershipModal({ isOpen, onClose }: PartnershipModalProps) {
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/partnership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      // Succès
      alert('✅ Merci ! Votre demande a été envoyée avec succès. Nous vous contacterons rapidement.');
      onClose();

      // Réinitialiser le formulaire
      setFormData({
        etablissement: '',
        type: 'ecole',
        responsable: '',
        email: '',
        telephone: '',
        ville: '',
        nombreEleves: '',
        message: '',
      });
    } catch (err) {
      logger.error('Partnership form submission failed', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-4 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative my-auto w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto"
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
        <h2 className="mb-4 sm:mb-6 font-playfair text-2xl sm:text-3xl font-bold text-[#1c1917]">
          Devenir École Partenaire
        </h2>
        <p className="mb-4 sm:mb-6 font-outfit text-sm sm:text-base text-stone-600">
          Rejoignez le réseau Safe Zone et sécurisez les sorties de votre établissement.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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

          {/* Message d'erreur */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 font-outfit text-sm">
              ❌ {error}
            </div>
          )}

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-4 font-outfit text-lg font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? '⏳ Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default PartnershipModal;
