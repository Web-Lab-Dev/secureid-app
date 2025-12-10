'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Loader2, ShoppingCart, CheckCircle } from 'lucide-react';
import { createOrder } from '@/actions/order-actions';
import type { OrderFormData } from '@/types/order';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRICE_PER_BRACELET = 5000;

export function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerPhone: '+226',
    quantity: 1,
    deliveryAddress: '',
    gpsLocation: null,
    deliveryNotes: '',
  });

  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-détection GPS au montage du composant
  useEffect(() => {
    if (isOpen && !formData.gpsLocation) {
      detectGPS();
    }
  }, [isOpen]);

  const detectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Géolocalisation non supportée par votre navigateur');
      return;
    }

    setIsLoadingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          gpsLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        }));
        setIsLoadingGPS(false);
      },
      (error) => {
        setGpsError('Impossible de détecter votre position');
        setIsLoadingGPS(false);
      }
    );
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, quantity: parseInt(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createOrder(formData);

    if (result.success) {
      setSubmitSuccess(true);
      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({
          customerName: '',
          customerPhone: '+226',
          quantity: 1,
          deliveryAddress: '',
          gpsLocation: null,
          deliveryNotes: '',
        });
        onClose();
      }, 3000);
    } else {
      setSubmitError(result.error || 'Une erreur est survenue');
    }

    setIsSubmitting(false);
  };

  const totalAmount = formData.quantity * PRICE_PER_BRACELET;

  if (!isOpen) return null;

  // Vue de succès
  if (submitSuccess) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 font-playfair text-2xl font-bold text-slate-900">
            Commande Reçue ! ✅
          </h2>
          <p className="text-slate-600">
            Merci pour votre commande. Un livreur vous contactera dans les 24h pour confirmer la
            livraison.
          </p>
        </div>
      </div>
    );
  }

  // Formulaire de commande
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl my-8 rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-orange-500" />
            <h2 className="font-playfair text-2xl font-bold text-slate-900">
              Commander des Bracelets
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Nom complet */}
            <div>
              <label
                htmlFor="customerName"
                className="mb-2 block font-outfit text-sm font-semibold text-slate-700"
              >
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-outfit text-slate-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="Ex: Ouedraogo Jean"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label
                htmlFor="customerPhone"
                className="mb-2 block font-outfit text-sm font-semibold text-slate-700"
              >
                Numéro de téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="customerPhone"
                required
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-outfit text-slate-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="+226 XX XX XX XX"
              />
            </div>

            {/* Quantité */}
            <div>
              <label
                htmlFor="quantity"
                className="mb-2 block font-outfit text-sm font-semibold text-slate-700"
              >
                Nombre de bracelets <span className="text-red-500">*</span>
              </label>
              <select
                id="quantity"
                value={formData.quantity}
                onChange={handleQuantityChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-outfit text-slate-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} bracelet{num > 1 ? 's' : ''} - {(num * PRICE_PER_BRACELET).toLocaleString('fr-FR')} FCFA
                  </option>
                ))}
              </select>
            </div>

            {/* Adresse de livraison */}
            <div>
              <label
                htmlFor="deliveryAddress"
                className="mb-2 block font-outfit text-sm font-semibold text-slate-700"
              >
                Adresse de livraison <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deliveryAddress"
                required
                rows={3}
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-outfit text-slate-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="Ex: Secteur 15, Rue 15.45, Maison après la pharmacie..."
              />
            </div>

            {/* GPS */}
            <div>
              <label className="mb-2 block font-outfit text-sm font-semibold text-slate-700">
                Position GPS (optionnel)
              </label>
              <div className="flex items-center gap-3">
                {isLoadingGPS ? (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-outfit text-sm">Détection en cours...</span>
                  </div>
                ) : formData.gpsLocation ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <MapPin className="h-5 w-5" />
                    <span className="font-outfit text-sm">
                      Position détectée ({formData.gpsLocation.lat.toFixed(4)}, {formData.gpsLocation.lng.toFixed(4)})
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={detectGPS}
                    className="flex items-center gap-2 rounded-lg border border-orange-500 px-4 py-2 font-outfit text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-50"
                  >
                    <MapPin className="h-4 w-4" />
                    Détecter ma position
                  </button>
                )}
              </div>
              {gpsError && (
                <p className="mt-2 font-outfit text-sm text-red-500">{gpsError}</p>
              )}
            </div>

            {/* Notes supplémentaires */}
            <div>
              <label
                htmlFor="deliveryNotes"
                className="mb-2 block font-outfit text-sm font-semibold text-slate-700"
              >
                Notes pour la livraison (optionnel)
              </label>
              <textarea
                id="deliveryNotes"
                rows={2}
                value={formData.deliveryNotes}
                onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 font-outfit text-slate-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="Ex: Appeler avant d'arriver, porte bleue..."
              />
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-outfit text-lg font-semibold text-slate-700">
                Total à payer:
              </span>
              <span className="font-playfair text-3xl font-bold text-orange-600">
                {totalAmount.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Message d'erreur */}
          {submitError && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-center">
              <p className="font-outfit text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-slate-300 px-6 py-3 font-outfit font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 font-outfit font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Envoi...
                </span>
              ) : (
                'Confirmer la commande'
              )}
            </button>
          </div>

          <p className="mt-4 text-center font-outfit text-xs text-slate-500">
            📞 Un livreur vous contactera dans les 24h pour confirmer la livraison
          </p>
        </form>
      </div>
    </div>
  );
}
