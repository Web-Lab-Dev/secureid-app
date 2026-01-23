'use client';

import { Shield, ShieldCheck, Heart, Building2 } from 'lucide-react';

export default function TrustBar() {
  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-stone-700 drop-shadow-sm">
          Conçu selon les standards de sécurité et de protection
        </p>

        {/* Bandeau statique - Plus d'animation infinie pour performance */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
          {/* Logo CIL */}
          <div
            className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-70"
            title="Commission de l'Informatique et des Libertés"
          >
            <ShieldCheck className="h-10 w-10 text-stone-700" aria-hidden="true" />
            <span className="text-xs font-medium text-stone-600">CIL</span>
          </div>

          {/* Logo BNSP */}
          <div
            className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-70"
            title="Brigade Nationale de Sapeurs-Pompiers"
          >
            <Shield className="h-10 w-10 text-stone-700" aria-hidden="true" />
            <span className="text-xs font-medium text-stone-600">BNSP</span>
          </div>

          {/* Logo Ministère */}
          <div
            className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-70"
            title="Ministère de la Famille - Protection de l'Enfance"
          >
            <Building2 className="h-10 w-10 text-stone-700" aria-hidden="true" />
            <span className="text-xs font-medium text-stone-600">Min. Famille</span>
          </div>

          {/* Logo Standards Médicaux */}
          <div
            className="flex items-center gap-2 grayscale opacity-50 transition-opacity hover:opacity-70"
            title="Standards Médicaux Certifiés"
          >
            <Heart className="h-10 w-10 text-stone-700" aria-hidden="true" />
            <span className="text-xs font-medium text-stone-600">Standards Médicaux</span>
          </div>
        </div>
      </div>
    </section>
  );
}
