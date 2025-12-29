'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, MessageCircle, Copy, Check } from 'lucide-react';
import type { ProfileDocument } from '@/types/profile';
import { logger } from '@/lib/logger';
import { ScanEffect } from './ScanEffect';
import { translateRelationship } from '@/lib/relationship-helpers';
import { getWhatsAppUrl } from '@/lib/config';
import { PhotoModal } from '@/components/ui/PhotoModal';

/**
 * PHASE 5 V2 - IDENTITY CARD (Badge Sécurité)
 *
 * Carte d'identité professionnelle avec:
 * - Photo + Nom + Âge (Flex Row)
 * - Bouton WhatsApp Parent intégré
 * - Bordure orange (liseré visuel)
 */

interface IdentityCardProps {
  profile: ProfileDocument;
}

function calculateAge(dateOfBirth: Date | string | null): number | null {
  if (!dateOfBirth) return null;

  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export function IdentityCard({ profile }: IdentityCardProps) {
  const [copied, setCopied] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const age = calculateAge(profile.dateOfBirth as Date | string | null);
  const primaryContact = profile.emergencyContacts[0];

  // Construire l'URL WhatsApp
  const whatsappUrl = primaryContact?.phone
    ? getWhatsAppUrl(primaryContact.phone, '')
    : null;

  // Copier le numéro dans le presse-papier
  const handleCopyPhone = async () => {
    if (!primaryContact?.phone) return;

    try {
      await navigator.clipboard.writeText(primaryContact.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 border-l-4 border-l-orange-500 bg-slate-900/60 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl">
      <div className="flex gap-4">
        {/* Photo (Gauche) - Clickable */}
        <button
          onClick={() => profile.photoUrl && setIsPhotoModalOpen(true)}
          className="relative h-24 w-24 flex-shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          disabled={!profile.photoUrl}
        >
          <div className="relative h-full w-full overflow-hidden rounded-lg border-2 border-slate-700 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            {profile.photoUrl ? (
              <Image
                src={profile.photoUrl}
                alt={profile.fullName}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-700">
                <User className="h-12 w-12 text-slate-500" />
              </div>
            )}
          </div>

          {/* Effet scan biométrique */}
          <ScanEffect />
        </button>

        {/* Infos (Droite) */}
        <div className="flex flex-1 flex-col justify-between">
          {/* Nom & Âge */}
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.fullName}</h1>
            {age !== null && (
              <p className="text-sm text-slate-400">
                {age} {age > 1 ? 'ans' : 'an'}
              </p>
            )}
          </div>

          {/* Bouton WhatsApp */}
          {whatsappUrl && primaryContact && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
            >
              <MessageCircle className="h-5 w-5" fill="currentColor" />
              <span>WhatsApp Parent</span>
            </a>
          )}

          {/* Fallback: Appeler si pas de WhatsApp */}
          {!whatsappUrl && primaryContact && (
            <a
              href={`tel:${primaryContact.phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Appeler Parent</span>
            </a>
          )}
        </div>
      </div>

      {/* Info Contact avec bouton Copy */}
      {primaryContact && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-slate-500">Contact d'urgence</p>
              <p className="text-sm text-slate-300">
                {primaryContact.name} · {translateRelationship(primaryContact.relationship)}
              </p>
              <p className="mt-1 text-sm font-mono text-slate-400">{primaryContact.phone}</p>
            </div>
            <button
              onClick={handleCopyPhone}
              className="group rounded-lg border border-white/10 bg-slate-800/40 p-2 transition-all hover:border-orange-500/50 hover:bg-orange-500/10 active:scale-95"
              title="Copier le numéro"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-slate-400 transition-colors group-hover:text-orange-500" />
              )}
            </button>
          </div>
          {copied && (
            <p className="mt-2 text-xs font-medium text-green-500">✓ Numéro copié!</p>
          )}
        </div>
      )}

      {/* Photo Modal */}
      {profile.photoUrl && (
        <PhotoModal
          photoUrl={profile.photoUrl}
          childName={profile.fullName}
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
        />
      )}
    </div>
  );
}
