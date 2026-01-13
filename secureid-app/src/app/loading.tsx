/**
 * Loading State - Page Racine
 *
 * Skeleton affiché pendant le chargement initial de l'application
 * Améliore la perception de performance (Web Vitals: FCP, LCP)
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header Skeleton */}
      <div className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo skeleton */}
          <div className="h-8 w-32 animate-pulse rounded-md bg-stone-700" />

          {/* Nav buttons skeleton */}
          <div className="flex gap-4">
            <div className="h-10 w-24 animate-pulse rounded-md bg-stone-700" />
            <div className="h-10 w-24 animate-pulse rounded-md bg-orange-600/30" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text content */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Title skeleton */}
            <div className="space-y-3">
              <div className="h-12 w-3/4 animate-pulse rounded-md bg-stone-800" />
              <div className="h-12 w-full animate-pulse rounded-md bg-stone-800" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-6 w-full animate-pulse rounded-md bg-stone-800/60" />
              <div className="h-6 w-5/6 animate-pulse rounded-md bg-stone-800/60" />
            </div>

            {/* CTA button skeleton */}
            <div className="h-14 w-48 animate-pulse rounded-md bg-orange-600/30" />
          </div>

          {/* Right: Image skeleton */}
          <div className="relative aspect-square w-full animate-pulse rounded-2xl bg-stone-800" />
        </div>
      </div>

      {/* Features Grid Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-xl border border-stone-800 bg-stone-900/30 p-6"
            >
              <div className="h-12 w-12 animate-pulse rounded-full bg-orange-600/30" />
              <div className="h-6 w-3/4 animate-pulse rounded-md bg-stone-800" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded-md bg-stone-800/60" />
                <div className="h-4 w-5/6 animate-pulse rounded-md bg-stone-800/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
