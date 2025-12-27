import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { AppLockScreen } from '@/components/auth/AppLockScreen';

/**
 * PHASE 4 - LAYOUT DASHBOARD
 *
 * Layout protégé pour toutes les pages du dashboard parent
 * Ajoute la navigation et vérifie l'authentification
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppLockScreen />
      <div className="min-h-screen bg-brand-black">
        <DashboardNav />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
