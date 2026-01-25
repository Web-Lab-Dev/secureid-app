'use client';

import { Shield, ShieldCheck, Heart, Building2 } from 'lucide-react';

const trustItems = [
  { icon: ShieldCheck, label: 'CIL', title: "Commission de l'Informatique et des Libertés" },
  { icon: Shield, label: 'BNSP', title: 'Brigade Nationale de Sapeurs-Pompiers' },
  { icon: Building2, label: 'Min. Famille', title: 'Ministère de la Famille - Protection de l\'Enfance' },
  { icon: Heart, label: 'Standards Médicaux', title: 'Standards Médicaux Certifiés' },
];

export default function TrustBar() {
  // Dupliquer pour effet de boucle infinie
  const duplicatedItems = [...trustItems, ...trustItems, ...trustItems];

  return (
    <section className="relative z-10 overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 py-8">
      <p className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-stone-700 drop-shadow-sm">
        Conçu selon les standards de sécurité et de protection
      </p>

      {/* Bande défilante infinie */}
      <div className="relative overflow-hidden">
        {/* Gradient fade gauche */}
        <div className="absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-stone-100 to-transparent pointer-events-none" />

        {/* Gradient fade droite */}
        <div className="absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-stone-50 to-transparent pointer-events-none" />

        {/* Container défilant */}
        <div className="flex animate-scroll-trust gap-12" style={{ width: 'max-content' }}>
          {duplicatedItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={`trust-${index}`}
                className="flex items-center gap-2 grayscale opacity-50"
                title={item.title}
                role="img"
                aria-label={item.title}
              >
                <Icon className="h-10 w-10 text-stone-700" aria-hidden="true" />
                <span className="text-xs font-medium text-stone-600 whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Styles pour l'animation */}
      <style jsx>{`
        @keyframes scroll-trust {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll-trust {
          animation: scroll-trust 15s linear infinite;
        }
      `}</style>
    </section>
  );
}
