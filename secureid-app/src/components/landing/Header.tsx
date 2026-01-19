'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/lib/config';

interface HeaderProps {
  braceletParams?: { id?: string; token?: string; welcome?: boolean };
}

export default function Header({ braceletParams }: HeaderProps) {
  // Construire l'URL avec les paramètres du bracelet si disponibles
  const getActivateUrl = () => {
    if (braceletParams?.id && braceletParams?.token) {
      return `/activate?id=${braceletParams.id}&token=${braceletParams.token}`;
    }
    return '/login';
  };

  const getButtonText = () => {
    return 'Se connecter';
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Shield className="h-6 w-6 text-orange-600" strokeWidth={2} aria-hidden="true" />
          <span className="font-playfair text-xl font-bold text-[#1c1917]">{APP_CONFIG.name}</span>
        </Link>

        {/* Navigation CTA */}
        <Button variant="gradient" size="sm" rounded="full" asChild>
          <Link href={getActivateUrl()}>
            {getButtonText()}
          </Link>
        </Button>
      </div>
    </header>
  );
}
