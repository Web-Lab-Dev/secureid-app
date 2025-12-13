'use client';

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PHASE 6C - AI CHATBOT FAB
 *
 * Floating Action Button pour l'assistant IA (mockup UI)
 * - Position: Fixed bottom-right
 * - Scroll responsive: Réduit en scrollant, étend au repos
 * - Gradient bleu/violet
 */

interface AIChatFabProps {
  onClick: () => void;
}

export function AIChatFab({ onClick }: AIChatFabProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Button
      onClick={onClick}
      variant="gradient"
      className={`
        fixed bottom-6 right-6 z-40
        flex items-center gap-2
        rounded-full
        bg-gradient-to-r from-blue-600 to-purple-600
        shadow-[0_8px_32px_rgba(59,130,246,0.5)]
        transition-all duration-300
        hover:scale-105 hover:shadow-[0_12px_48px_rgba(59,130,246,0.6)]
        active:scale-95
        ${isScrolled ? 'px-3 py-3' : 'px-5 py-3'}
      `}
    >
      <Bot className="h-6 w-6 shrink-0" />
      {!isScrolled && <span className="text-sm">Assistant IA</span>}
    </Button>
  );
}
