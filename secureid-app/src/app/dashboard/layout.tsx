import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { AppLockScreen } from '@/components/auth/AppLockScreen';
import { Toaster } from 'sonner';

/**
 * PHASE 4 - LAYOUT DASHBOARD
 *
 * Layout protégé pour toutes les pages du dashboard parent
 * Ajoute la navigation et vérifie l'authentification
 * PHASE 10 - Toast notifications (Sonner)
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppLockScreen />
      <div className="relative min-h-screen bg-soft-constellation">
        {/* Vignette overlay pour effet premium */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        {/* Contenu */}
        <div className="relative z-10">
          <DashboardNav />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </div>
      </div>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        duration={4000}
      />
    </AuthGuard>
  );
}
