import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { NotificationsPageClient } from './page-client';

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <DashboardNav />
      <div className="container mx-auto px-4">
        <NotificationsPageClient />
      </div>
    </main>
  );
}
