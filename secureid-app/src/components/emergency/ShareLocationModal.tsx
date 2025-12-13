'use client';

import { MessageCircle, MessageSquare, Copy, X, Share2 } from 'lucide-react';
import { useState } from 'react';
import type { GeolocationData } from '@/types/scan';
import { Button } from '@/components/ui/button';
import { getGoogleMapsUrl, getWhatsAppUrl, getEmergencyAlertMessage, APP_CONFIG } from '@/lib/config';

/**
 * PHASE 6.5 - SHARE LOCATION MODAL
 *
 * Modal de partage de position GPS multi-canal:
 * - Web Share API (natif mobile)
 * - WhatsApp
 * - SMS
 * - Copier dans le presse-papier
 */

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeolocationData;
  contactPhone: string;
}

export function ShareLocationModal({
  isOpen,
  onClose,
  location,
  contactPhone,
}: ShareLocationModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const googleMapsLink = getGoogleMapsUrl(location.lat, location.lng);
  const message = getEmergencyAlertMessage(location);

  // Web Share API (natif mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Alerte ${APP_CONFIG.name}`,
          text: 'Bracelet scanné ici:',
          url: googleMapsLink,
        });
        onClose();
      } catch (err) {
        // User cancelled or error - ignore
      }
    }
  };

  // WhatsApp
  const handleWhatsApp = () => {
    const whatsappUrl = getWhatsAppUrl(contactPhone, message);
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  // SMS
  const handleSMS = () => {
    const smsUrl = `sms:${contactPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
    onClose();
  };

  // Copier
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="rounded-t-3xl bg-slate-900 border-t border-slate-700 px-6 py-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Transmettre la position
            </h3>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Option: Web Share (si disponible) */}
            {navigator.share !== undefined && (
              <Button
                onClick={handleNativeShare}
                variant="secondary"
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all transform hover:scale-[1.02]"
              >
                <div className="rounded-full bg-purple-500/20 p-3">
                  <Share2 className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Partager</p>
                  <p className="text-sm text-gray-400">Ouvrir le menu de partage</p>
                </div>
              </Button>
            )}

            {/* Option: WhatsApp */}
            <Button
              onClick={handleWhatsApp}
              variant="secondary"
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all transform hover:scale-[1.02]"
            >
              <div className="rounded-full bg-green-500/20 p-3">
                <MessageCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">WhatsApp</p>
                <p className="text-sm text-gray-400">Ouvrir dans WhatsApp</p>
              </div>
            </Button>

            {/* Option: SMS */}
            <Button
              onClick={handleSMS}
              variant="secondary"
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all transform hover:scale-[1.02]"
            >
              <div className="rounded-full bg-blue-500/20 p-3">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">SMS</p>
                <p className="text-sm text-gray-400">Sans connexion internet</p>
              </div>
            </Button>

            {/* Option: Copier */}
            <Button
              onClick={handleCopy}
              variant="secondary"
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all transform hover:scale-[1.02]"
            >
              <div className="rounded-full bg-gray-500/20 p-3">
                <Copy className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">
                  {copied ? '✓ Copié !' : 'Copier'}
                </p>
                <p className="text-sm text-gray-400">
                  {copied ? 'Dans le presse-papier' : 'Copier le lien'}
                </p>
              </div>
            </Button>
          </div>

          {/* Footer info */}
          <div className="mt-4 text-center text-xs text-gray-500">
            Position: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
        </div>
      </div>
    </>
  );
}
