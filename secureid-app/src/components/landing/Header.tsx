'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo SecureID */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Shield className="h-6 w-6 text-orange-600" strokeWidth={2} aria-hidden="true" />
          <span className="font-playfair text-xl font-bold text-[#1c1917]">SecureID</span>
        </Link>

        {/* Navigation CTA */}
        <Link
          href="/login"
          className="rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-2 font-outfit text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          Se connecter
        </Link>
      </div>
    </header>
  );
}
