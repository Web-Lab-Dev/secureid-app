"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        {/* Icône avec effet de pulsation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(249, 115, 22, 0.4)",
                "0 0 0 20px rgba(249, 115, 22, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full"
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-brand-orange/10">
            <Shield className="h-12 w-12 text-brand-orange" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-mono text-2xl font-bold tracking-wider text-tactical-green"
        >
          SecureID
        </motion.h1>

        {/* Bouton principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            size="lg"
            className="h-14 min-h-[44px] bg-brand-orange px-8 font-mono text-base font-semibold tracking-wide text-white hover:bg-brand-orange/90"
          >
            SYSTÈME OPÉRATIONNEL
          </Button>
        </motion.div>

        {/* Indicateur de statut */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 text-sm font-mono text-tactical-green/70"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-tactical-green"
          />
          <span>CONNEXION SÉCURISÉE</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
