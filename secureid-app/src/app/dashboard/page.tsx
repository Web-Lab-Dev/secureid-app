import { DashboardPageClient } from './page-client';

/**
 * PHASE 4 - PAGE DASHBOARD (SERVER COMPONENT)
 *
 * Page principale du dashboard parent
 * Affiche la liste des enfants avec leurs bracelets
 *
 * Route: /dashboard
 * Protection: AuthGuard dans layout.tsx
 */

export const metadata = {
  title: 'Dashboard - SecureID',
  description: 'Gérez vos bracelets et profils enfants',
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
