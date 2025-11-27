'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { BraceletDocument } from '@/types/bracelet';
import type { ProfileDocument } from '@/types/profile';
import { EmergencyHeader } from '@/components/emergency/EmergencyHeader';
import { IdentityCard } from '@/components/emergency/IdentityCard';
import { MedicalCard } from '@/components/emergency/MedicalCard';
import { ActionsFooter } from '@/components/emergency/ActionsFooter';
import { PinDialog } from '@/components/emergency/PinDialog';
import { AIChatFab } from '@/components/emergency/AIChatFab';
import { AIChatSheet } from '@/components/emergency/AIChatSheet';
import { useGeolocation } from '@/hooks/useGeolocation';
import { recordScan } from '@/actions/emergency-actions';

/**
 * PHASE 5 V2 - EMERGENCY VIEW (UX AMÉLIORÉE)
 *
 * Nouvelle structure avec scroll naturel:
 * - Carte 1: Identité & Contact (badge sécurité)
 * - Carte 2: Médical & Vital (dossier médical)
 * - Footer: Actions secondaires (GPS, Portail médecin)
 */

interface EmergencyViewClientProps {
  bracelet: BraceletDocument;
  profile: ProfileDocument;
}

export function EmergencyViewClient({ bracelet, profile }: EmergencyViewClientProps) {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [scanRecorded, setScanRecorded] = useState(false);
  const geolocation = useGeolocation();

  // Enregistrer le scan au chargement
  useEffect(() => {
    if (!scanRecorded) {
      const userAgent = navigator.userAgent;

      recordScan({
        braceletId: bracelet.id,
        geolocation: geolocation.data,
        userAgent,
      }).then(() => {
        setScanRecorded(true);
      });
    }
  }, [bracelet.id, geolocation.data, scanRecorded]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const hasAllergies = profile.medicalInfo.allergies.length > 0;
  const hasMedicalInfo =
    hasAllergies ||
    profile.medicalInfo.conditions.length > 0 ||
    profile.medicalInfo.medications.length > 0 ||
    profile.medicalInfo.bloodType ||
    profile.medicalInfo.notes;

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: `
          radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.05) 0px, transparent 50%),
          radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.05) 0px, transparent 50%),
          radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.05) 0px, transparent 50%),
          #0f172a
        `
      }}
    >
      {/* Header avec statut */}
      <EmergencyHeader hasAlert={hasAllergies} />

      {/* Contenu principal - Scroll naturel avec gap entre cartes */}
      <motion.div
        className="flex flex-col gap-6 p-4 pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* CARTE 1: Identité & Contact (Badge Sécurité) */}
        <motion.div variants={cardVariants}>
          <IdentityCard profile={profile} />
        </motion.div>

        {/* CARTE 2: Médical & Vital (Dossier) - Conditionnelle */}
        {hasMedicalInfo && (
          <motion.div variants={cardVariants}>
            <MedicalCard profile={profile} />
          </motion.div>
        )}

        {/* Footer: Actions Secondaires */}
        <motion.div variants={cardVariants}>
          <ActionsFooter
            geolocation={geolocation}
            onOpenMedicalPortal={() => setIsPinDialogOpen(true)}
          />
        </motion.div>
      </motion.div>

      {/* Dialog PIN Médecin */}
      <PinDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        profileId={profile.id}
      />

      {/* AI Chat FAB & Sheet */}
      <AIChatFab onClick={() => setIsAIChatOpen(true)} />
      <AIChatSheet isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}
