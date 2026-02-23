'use client';

import { useState } from 'react';
import { X, Loader2, ShoppingCart, CheckCircle } from 'lucide-react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { PRICING } from '@/lib/config';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fonction pour générer un ID de commande
function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  quantity: number;
  deliveryAddress: string;
}

export function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerPhone: '+226',
    quantity: 1,
    deliveryAddress: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, quantity: parseInt(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // AbortController pour timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      // Générer l'ID de commande
      const orderId = generateOrderId();
      const totalAmount = formData.quantity * PRICING.bracelet.priceInCFA;

      // Appeler l'API directement avec AbortController
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          quantity: formData.quantity,
          pricePerBracelet: PRICING.bracelet.priceInCFA,
          totalAmount,
          deliveryAddress: formData.deliveryAddress,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitSuccess(true);
        // Réinitialiser le formulaire après 3 secondes
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormData({
            customerName: '',
            customerPhone: '+226',
            quantity: 1,
            deliveryAddress: '',
          });
          onClose();
        }, 3000);
      } else {
        throw new Error(result.details || result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error('Order request timeout after 30s');
        setSubmitError('La requête a expiré. Veuillez réessayer.');
      } else {
        logger.error('Failed to submit order', error);
        setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Vue de succès
  if (submitSuccess) {
    return (
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
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
            Merci pour votre commande. Nous vous contacterons dans les 24h pour confirmer votre commande.
          </p>
        </div>
      </div>
    );
  }

  // Formulaire de commande
  return (
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center bg-black/50 p-4 overflow-y-auto pt-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mb-8 rounded-2xl bg-white shadow-2xl"
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
                placeholder="Ex: Sawadogo Malick"
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
                    {num} bracelet{num > 1 ? 's' : ''}
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
                placeholder="Ex: Secteur 30, Quartier Gounghin, Rue 30.250..."
              />
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
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              size="md"
              className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="gradient"
              size="md"
              className="flex-1 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Confirmer la commande</span>
                </>
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
