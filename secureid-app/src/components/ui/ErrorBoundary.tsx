'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle errors in child components.
 * Prevents entire app crashes from component failures.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 p-6">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-white">
            Une erreur est survenue
          </h3>
          <p className="mb-4 text-sm text-slate-400 text-center max-w-md">
            Ce composant n&apos;a pas pu se charger correctement.
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight fallback for dialog loading errors
 */
export function DialogErrorFallback({ onClose }: { onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-sm rounded-lg border border-red-500/30 bg-slate-900 p-6 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h3 className="mb-2 font-semibold text-white">Erreur de chargement</h3>
        <p className="mb-4 text-sm text-slate-400">
          Impossible de charger ce contenu.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  );
}
