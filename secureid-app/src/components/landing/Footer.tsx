'use client';

import Link from 'next/link';
import { Shield, Phone, MessageCircle, Mail, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-stone-200 bg-[#FAFAF9] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Colonne 1: Logo et description */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-8 w-8 text-amber-600" strokeWidth={2} aria-hidden="true" />
              <span className="font-playfair text-2xl font-bold text-[#1c1917]">SecureID</span>
            </div>
            <p className="font-outfit text-sm leading-relaxed text-[#78716c]">
              Protégez ce qui compte le plus. Un lien invisible qui veille sur vos enfants.
            </p>
          </div>

          {/* Colonne 2: Liens */}
          <div>
            <h3 className="mb-4 font-outfit font-semibold text-[#1c1917]">Informations</h3>
            <ul className="space-y-2 font-outfit text-sm text-[#78716c]">
              <li>
                <Link href="/login" className="hover:text-amber-600 transition-colors">
                  Activer un bracelet
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-600 transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-amber-600 transition-colors">
                  À propos
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Contact */}
          <div>
            <h3 className="mb-4 font-outfit font-semibold text-[#1c1917]">Contact</h3>
            <p className="mb-4 font-outfit text-sm font-semibold text-[#1c1917]">
              +226 77 04 04 92 / 72 98 25 02
            </p>

            {/* Logos sociaux avec couleurs de marque */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Téléphone */}
              <a
                href="tel:+22677040492"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition-all hover:bg-orange-600 hover:scale-110"
                aria-label="Appeler +226 77 04 04 92"
                title="Appel"
              >
                <Phone className="h-5 w-5" />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/22677040492"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-all hover:bg-[#20BD5A] hover:scale-110"
                aria-label="WhatsApp +226 77 04 04 92"
                title="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>

              {/* Email */}
              <a
                href="mailto:tko364796@gmail.com"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EA4335] text-white transition-all hover:bg-[#D33426] hover:scale-110"
                aria-label="Email tko364796@gmail.com"
                title="Email"
              >
                <Mail className="h-5 w-5" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/swabo-hamadou-ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0077B5] text-white transition-all hover:bg-[#006399] hover:scale-110"
                aria-label="LinkedIn Swabo Hamadou"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-stone-200 pt-8 text-center">
          <p className="font-outfit text-sm text-[#a8a29e]">
            © {new Date().getFullYear()} SecureID. Protégez ce qui compte le plus.
          </p>
        </div>
      </div>
    </footer>
  );
}
