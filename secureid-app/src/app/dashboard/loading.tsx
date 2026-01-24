/**
 * Loading State - Dashboard
 *
 * Skeleton affiché pendant le chargement du tableau de bord
 * S'affiche pendant que Firebase charge les données utilisateur
 *
 * THEME: Dark (cohérent avec le dashboard)
 */

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header Skeleton */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo skeleton */}
          <div className="h-8 w-32 animate-pulse rounded-md bg-slate-700" />

          {/* User menu skeleton */}
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-700" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="mb-2 h-8 w-64 animate-pulse rounded-md bg-slate-700" />
          <div className="h-5 w-96 animate-pulse rounded-md bg-slate-800" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-6"
            >
              <div className="h-5 w-32 animate-pulse rounded-md bg-slate-700" />
              <div className="h-10 w-20 animate-pulse rounded-md bg-slate-700" />
            </div>
          ))}
        </div>

        {/* Bracelets Grid Skeleton */}
        <div className="mb-6">
          <div className="mb-4 h-7 w-48 animate-pulse rounded-md bg-slate-700" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6"
            >
              {/* Profile image skeleton */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 animate-pulse rounded-full bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded-md bg-slate-700" />
                  <div className="h-4 w-24 animate-pulse rounded-md bg-slate-800" />
                </div>
              </div>

              {/* Bracelet info skeleton */}
              <div className="space-y-2 border-t border-slate-700 pt-4">
                <div className="h-4 w-full animate-pulse rounded-md bg-slate-800" />
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-800" />
              </div>

              {/* Action buttons skeleton */}
              <div className="flex gap-2 pt-2">
                <div className="h-10 flex-1 animate-pulse rounded-md bg-slate-700" />
                <div className="h-10 flex-1 animate-pulse rounded-md bg-brand-orange/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Add Bracelet Button Skeleton */}
        <div className="mt-8">
          <div className="h-12 w-64 animate-pulse rounded-md bg-brand-orange/30" />
        </div>
      </div>
    </div>
  );
}
