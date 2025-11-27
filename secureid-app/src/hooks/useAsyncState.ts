import { useState, useCallback } from 'react';

/**
 * Hook réutilisable pour gérer l'état asynchrone (loading/error/data)
 * Évite la duplication du pattern loading/error dans tous les hooks
 */
export function useAsyncState<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exécute une fonction asynchrone et gère automatiquement loading/error/data
   */
  const execute = useCallback(async (fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Réinitialise l'état à ses valeurs initiales
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
    setLoading
  };
}
