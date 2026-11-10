import React from 'react';

interface SilentErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface SilentErrorBoundaryState {
  hasError: boolean;
  retryCount: number;
}

/**
 * Contenedor de Resiliencia Silenciosa — Residencias Caroní
 * Intercepta fallos de carga diferida (lazy chunks) o errores transitorios de renderizado
 * y reintenta automáticamente sin interrumpir la experiencia del inversionista.
 */
export class SilentErrorBoundary extends React.Component<SilentErrorBoundaryProps, SilentErrorBoundaryState> {
  private retryTimer: number | null = null;
  declare props: Readonly<SilentErrorBoundaryProps>;
  declare setState: (
    updater:
      | Partial<SilentErrorBoundaryState>
      | ((prevState: Readonly<SilentErrorBoundaryState>) => Partial<SilentErrorBoundaryState>)
  ) => void;
  public state: SilentErrorBoundaryState = {
    hasError: false,
    retryCount: 0,
  };

  static getDerivedStateFromError(): Partial<SilentErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn('[SilentSelfHealing] Recuperando componente de forma transparente:', error.message, errorInfo.componentStack);

    if (this.state.retryCount < 2 && typeof window !== 'undefined') {
      this.retryTimer = window.setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          retryCount: prev.retryCount + 1,
        }));
      }, 250);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.retryTimer);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
