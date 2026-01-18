/**
 * Next.js Instrumentation
 * Exécuté au démarrage du serveur (une seule fois)
 * Parfait pour la validation des env vars et l'initialisation
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Validation des variables d'environnement au démarrage
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvVarsOrThrow } = await import('./lib/env-validation');

    try {
      validateEnvVarsOrThrow();
    } catch (error) {
      console.error('❌ Échec de la validation des variables d\'environnement');
      console.error('Consultez .env.example pour la configuration requise');
      // En production, on ne bloque pas le démarrage mais on log l'erreur
      if (process.env.NODE_ENV === 'development') {
        process.exit(1);
      }
    }
  }
}
