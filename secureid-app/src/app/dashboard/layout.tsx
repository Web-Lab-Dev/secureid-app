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
 *
 * DESIGN: Background inspiré du drapeau du Burkina Faso
 * Rouge (haut) → Vert (bas) avec étoile centrale en filigrane
 * Effet subtil et doux derrière les dots constellation
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
        {/* Burkina Faso Flag Background - Subtil et élégant, au-dessus des dots */}
        <div className="pointer-events-none fixed inset-0 z-[1]">
          {/* Dégradé Rouge → Vert du drapeau avec mode overlay pour fusion douce */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(210, 16, 52, 0.12) 0%, rgba(210, 16, 52, 0.08) 42%, transparent 50%, rgba(0, 151, 57, 0.08) 58%, rgba(0, 151, 57, 0.12) 100%)',
              mixBlendMode: 'soft-light',
            }}
          />
          {/* Étoile dorée centrale - filigrane élégant */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="h-[50vh] w-[50vh] max-h-[400px] max-w-[400px]"
              style={{ opacity: 0.06 }}
              fill="#FCD116"
            >
              <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" />
            </svg>
          </div>
          {/* Halo doré subtil autour de l'étoile */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(252, 209, 22, 0.05) 0%, transparent 35%)',
            }}
          />
        </div>

        {/* Vignette overlay pour effet premium */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/5 via-transparent to-black/30" />

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
