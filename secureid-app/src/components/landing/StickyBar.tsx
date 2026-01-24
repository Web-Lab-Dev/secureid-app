'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { getActivateUrl, type BraceletParams } from '@/lib/url-helpers';

interface StickyBarProps {
  braceletParams?: BraceletParams;
}

export default function StickyBar({ braceletParams }: StickyBarProps) {

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/20 bg-white/80 p-4 backdrop-blur-lg sm:hidden"
    >
      <Link
        href={getActivateUrl(braceletParams)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 py-3 font-outfit font-semibold text-white shadow-lg shadow-orange-500/30"
      >
        <Shield className="h-5 w-5" aria-hidden="true" />
        ACTIVER SA PROTECTION
      </Link>
    </motion.div>
  );
}
