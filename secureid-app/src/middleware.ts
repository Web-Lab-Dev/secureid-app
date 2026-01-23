import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * MIDDLEWARE RATE LIMITING - SECUREID
 *
 * Protection contre le spam et les attaques DDoS sur les routes API
 * Limite: 5 requêtes par minute par IP
 *
 * ⚠️ LIMITATIONS CONNUES:
 * - Rate limiting en mémoire volatile (reset à chaque redéploiement)
 * - Chaque région Vercel Edge a sa propre mémoire (non partagée)
 * - setInterval peut ne pas fonctionner correctement dans Edge Runtime
 *
 * 📋 TODO PRODUCTION: Migrer vers Upstash Redis pour:
 * - Persistance entre déploiements
 * - Partage entre régions Edge
 * - Rate limiting distribué fiable
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Map en mémoire pour stocker les compteurs par IP
// Note: Sur Vercel Edge, chaque région a sa propre mémoire
const rateLimitMap = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requêtes max

// ⚠️ WARNING: setInterval dans Edge Runtime peut ne pas s'exécuter de façon fiable
// car les contextes d'exécution sont de courte durée.
// En pratique, le cleanup se fait naturellement car la Map est réinitialisée
// à chaque cold start. Garder ce code comme fallback pour les instances longue durée.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Appliquer rate limiting uniquement sur routes API publiques
  if (pathname.startsWith('/api/order') || pathname.startsWith('/api/partnership')) {
    // Extraire l'IP (Vercel fournit x-forwarded-for)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || 'unknown';

    const now = Date.now();
    const rateLimitEntry = rateLimitMap.get(ip);

    // Si l'entrée existe et n'a pas expiré
    if (rateLimitEntry) {
      // Vérifier si la fenêtre est expirée
      if (now > rateLimitEntry.resetTime) {
        // Réinitialiser le compteur
        rateLimitMap.set(ip, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW_MS,
        });
      } else {
        // Fenêtre active - vérifier la limite
        if (rateLimitEntry.count >= RATE_LIMIT_MAX_REQUESTS) {
          // Limite dépassée
          const retryAfter = Math.ceil((rateLimitEntry.resetTime - now) / 1000);

          return NextResponse.json(
            {
              error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
              retryAfter: `${retryAfter}s`,
            },
            {
              status: 429,
              headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimitEntry.resetTime.toString(),
              },
            }
          );
        }

        // Incrémenter le compteur
        rateLimitEntry.count += 1;
        rateLimitMap.set(ip, rateLimitEntry);
      }
    } else {
      // Première requête de cette IP
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    // Ajouter headers de rate limit à la réponse
    const response = NextResponse.next();
    const currentEntry = rateLimitMap.get(ip)!;
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
    response.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, RATE_LIMIT_MAX_REQUESTS - currentEntry.count).toString()
    );
    response.headers.set('X-RateLimit-Reset', currentEntry.resetTime.toString());

    return response;
  }

  return NextResponse.next();
}

// Configuration du matcher pour optimiser les performances
// Appliquer uniquement sur les routes API concernées
export const config = {
  matcher: [
    '/api/order/:path*',
    '/api/partnership/:path*',
  ],
};
