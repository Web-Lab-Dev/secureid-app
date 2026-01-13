import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * LOGGING AVANCÉ POUR ROUTES API
 *
 * Enregistre les requêtes API avec contexte complet pour:
 * - Débogage et forensics
 * - Détection d'attaques
 * - Monitoring de performance
 * - Audit de sécurité
 */

interface ApiLogMetadata {
  /** Identifiant de corrélation (pour tracer une requête à travers les services) */
  correlationId: string;
  /** Adresse IP du client */
  ip: string;
  /** User-Agent du navigateur/client */
  userAgent: string;
  /** Timestamp ISO 8601 */
  timestamp: string;
  /** Chemin API appelé */
  path: string;
  /** Méthode HTTP */
  method: string;
  /** Durée de traitement en ms (si fournie) */
  duration?: number;
  /** Données métier spécifiques à l'action */
  [key: string]: unknown;
}

/**
 * Extrait l'IP réelle du client depuis les headers
 * Gère les proxies (Vercel, Cloudflare, etc.)
 */
function extractClientIp(request: NextRequest): string {
  // Ordre de priorité pour extraction IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs (client, proxy1, proxy2...)
    // On prend la première (IP réelle du client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Extrait ou génère un correlation ID pour tracer la requête
 */
function extractCorrelationId(request: NextRequest): string {
  // Vérifier si le client a fourni un correlation ID
  const clientCorrelationId = request.headers.get('x-correlation-id');
  if (clientCorrelationId) {
    return clientCorrelationId;
  }

  // Générer un nouveau correlation ID (UUID v4)
  return crypto.randomUUID();
}

/**
 * Hash une chaîne pour logging sécurisé (SHA-256)
 * Utile pour hasher des données sensibles (emails, téléphones)
 */
async function hashForLogging(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16); // Premiers 16 caractères suffisent
}

/**
 * Enregistre une requête API avec contexte complet
 *
 * @param request - Requête Next.js
 * @param action - Description de l'action (ex: "order_created", "partnership_requested")
 * @param metadata - Métadonnées métier additionnelles
 *
 * @example
 * await logApiRequest(request, 'order_created', {
 *   orderId: 'ORD-20260113-001',
 *   customerPhone: '+22670123456',
 *   amount: 15000
 * });
 */
export async function logApiRequest(
  request: NextRequest,
  action: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const ip = extractClientIp(request);
  const correlationId = extractCorrelationId(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const logData: ApiLogMetadata = {
    correlationId,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    method: request.method,
    ...metadata,
  };

  logger.info(`API: ${action}`, logData);
}

/**
 * Enregistre une erreur API avec contexte complet
 *
 * @param request - Requête Next.js
 * @param action - Action qui a échoué
 * @param error - Erreur capturée
 * @param metadata - Métadonnées additionnelles
 *
 * @example
 * logApiError(request, 'order_creation_failed', error, {
 *   orderId: 'ORD-20260113-001'
 * });
 */
export function logApiError(
  request: NextRequest,
  action: string,
  error: unknown,
  metadata: Record<string, unknown> = {}
): void {
  const ip = extractClientIp(request);
  const correlationId = extractCorrelationId(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData: ApiLogMetadata & { error: unknown } = {
    correlationId,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    method: request.method,
    error: {
      message: errorMessage,
      stack: errorStack,
    },
    ...metadata,
  };

  logger.error(`API Error: ${action}`, logData);
}

/**
 * Enregistre un événement de sécurité suspect
 *
 * @param request - Requête Next.js
 * @param eventType - Type d'événement (ex: "rate_limit_exceeded", "invalid_input")
 * @param details - Détails de l'événement
 *
 * @example
 * logSecurityEvent(request, 'rate_limit_exceeded', {
 *   limit: 5,
 *   attempts: 10
 * });
 */
export function logSecurityEvent(
  request: NextRequest,
  eventType: string,
  details: Record<string, unknown> = {}
): void {
  const ip = extractClientIp(request);
  const correlationId = extractCorrelationId(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const logData = {
    correlationId,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    method: request.method,
    eventType,
    ...details,
  };

  logger.warn(`Security Event: ${eventType}`, logData);
}

/**
 * Utilitaire pour hasher un numéro de téléphone pour logging sécurisé
 * (async version)
 */
export async function hashPhoneForLogging(phone: string): Promise<string> {
  return await hashForLogging(phone);
}

/**
 * Utilitaire pour hasher un email pour logging sécurisé
 * (async version)
 */
export async function hashEmailForLogging(email: string): Promise<string> {
  return await hashForLogging(email);
}

/**
 * Middleware helper: Ajouter correlation ID à la réponse
 * Permet au client de référencer une requête spécifique pour support
 */
export function addCorrelationIdHeader(
  request: NextRequest,
  headers: Headers = new Headers()
): Headers {
  const correlationId = extractCorrelationId(request);
  headers.set('X-Correlation-ID', correlationId);
  return headers;
}
