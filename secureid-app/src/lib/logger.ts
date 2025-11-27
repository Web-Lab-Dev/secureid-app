/**
 * Système de logging conditionnel
 * Les logs de debug ne s'affichent qu'en développement
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log de debug (uniquement en développement)
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log d'information (uniquement en développement)
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Avertissement (toujours affiché)
   */
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Erreur (toujours affichée)
   */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Log groupé (uniquement en développement)
   */
  group: (label: string, fn: () => void) => {
    if (isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  }
};
