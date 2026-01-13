/**
 * Loading State - Page À Propos
 *
 * Skeleton affiché pendant le chargement de la page À Propos
 * Améliore l'expérience utilisateur pendant le chargement des images et du carrousel
 */

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header Skeleton */}
      <div className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="h-8 w-32 animate-pulse rounded-md bg-stone-200" />
          <div className="flex gap-4">
            <div className="h-10 w-24 animate-pulse rounded-md bg-stone-200" />
            <div className="h-10 w-24 animate-pulse rounded-md bg-orange-200" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section Skeleton */}
        <div className="mb-16 text-center">
          <div className="mx-auto mb-4 h-12 w-3/4 animate-pulse rounded-md bg-stone-200" />
          <div className="mx-auto h-6 w-1/2 animate-pulse rounded-md bg-stone-200/60" />
        </div>

        {/* CEO Section Skeleton */}
        <div className="mb-20 grid gap-12 lg:grid-cols-2">
          {/* CEO Photo Skeleton */}
          <div className="relative aspect-square animate-pulse overflow-hidden rounded-2xl bg-stone-200" />

          {/* CEO Info Skeleton */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-3">
              <div className="h-10 w-48 animate-pulse rounded-md bg-stone-200" />
              <div className="h-6 w-64 animate-pulse rounded-md bg-stone-200/60" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-full animate-pulse rounded-md bg-stone-200/60" />
              <div className="h-5 w-full animate-pulse rounded-md bg-stone-200/60" />
              <div className="h-5 w-3/4 animate-pulse rounded-md bg-stone-200/60" />
            </div>
          </div>
        </div>

        {/* Mission Section Skeleton */}
        <div className="mb-20 space-y-8">
          <div className="mx-auto h-10 w-64 animate-pulse rounded-md bg-stone-200" />
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4 rounded-xl border bg-white p-6">
                <div className="h-12 w-12 animate-pulse rounded-full bg-orange-200" />
                <div className="h-6 w-3/4 animate-pulse rounded-md bg-stone-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-md bg-stone-200/60" />
                  <div className="h-4 w-5/6 animate-pulse rounded-md bg-stone-200/60" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Section Skeleton */}
        <div className="mb-20">
          <div className="mx-auto mb-8 h-10 w-96 animate-pulse rounded-md bg-stone-200" />
          <div className="relative h-[600px] overflow-hidden rounded-2xl bg-stone-200">
            {/* Carousel items skeleton */}
            <div className="flex gap-4 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[500px] w-[300px] flex-shrink-0 animate-pulse rounded-xl bg-stone-300"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Impact Stats Skeleton */}
        <div className="mb-20 grid gap-8 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4 text-center">
              <div className="mx-auto h-12 w-24 animate-pulse rounded-md bg-orange-200" />
              <div className="mx-auto h-5 w-32 animate-pulse rounded-md bg-stone-200/60" />
            </div>
          ))}
        </div>

        {/* CTA Section Skeleton */}
        <div className="rounded-2xl border bg-gradient-to-br from-orange-50 to-stone-50 p-12 text-center">
          <div className="mx-auto mb-4 h-10 w-3/4 animate-pulse rounded-md bg-stone-200" />
          <div className="mx-auto mb-8 h-6 w-1/2 animate-pulse rounded-md bg-stone-200/60" />
          <div className="mx-auto h-12 w-64 animate-pulse rounded-md bg-orange-200" />
        </div>
      </div>
    </div>
  );
}
