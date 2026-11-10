import React from 'react';
import { CaroniIsotype } from './ArchitecturalDrawings';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  retryCount: number;
  recoveryKey: number;
}

const MAX_SILENT_RETRIES = 3;

/**
 * GlobalErrorBoundary — Residencias Caroní · Altamira, Caracas
 * Contenedor de nivel superior para captura de errores de renderizado en tiempo de ejecución
 * con auto-recuperación silenciosa y preservación de continuidad visual institucional.
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Ingeniería de Software: Ing. Luis Martinez
 */
export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  private retryTimer: number | null = null;
  declare props: Readonly<GlobalErrorBoundaryProps>;
  declare setState: (
    updater:
      | Partial<GlobalErrorBoundaryState>
      | ((prevState: Readonly<GlobalErrorBoundaryState>) => Partial<GlobalErrorBoundaryState>)
  ) => void;

  public state: GlobalErrorBoundaryState = {
    hasError: false,
    retryCount: 0,
    recoveryKey: 0,
  };

  static getDerivedStateFromError(): Partial<GlobalErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidMount(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleNetworkRestored);
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn(
      '[GlobalErrorBoundary] Recuperación silenciosa activada:',
      error?.message || error,
      errorInfo?.componentStack
    );

    if (this.state.retryCount < MAX_SILENT_RETRIES && typeof window !== 'undefined') {
      if (this.retryTimer !== null) {
        window.clearTimeout(this.retryTimer);
      }
      const delayMs = this.state.retryCount === 0 ? 50 : 250 * this.state.retryCount;
      this.retryTimer = window.setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          retryCount: prev.retryCount + 1,
          recoveryKey: prev.recoveryKey + 1,
        }));
      }, delayMs);
    }
  }

  componentWillUnmount(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleNetworkRestored);
      if (this.retryTimer !== null) {
        window.clearTimeout(this.retryTimer);
      }
    }
  }

  private handleNetworkRestored = (): void => {
    if (this.state.hasError) {
      this.setState((prev) => ({
        hasError: false,
        retryCount: 0,
        recoveryKey: prev.recoveryKey + 1,
      }));
    }
  };

  private handleManualReset = (): void => {
    this.setState((prev) => ({
      hasError: false,
      retryCount: 0,
      recoveryKey: prev.recoveryKey + 1,
    }));
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Mientras ejecuta los reintentos automáticos silenciosos, mantiene el lienzo institucional sin parpadeos de error
      if (this.state.retryCount < MAX_SILENT_RETRIES) {
        return (
          <div
            className="min-h-screen w-full bg-[#EFEBE0] text-[#1B1813]"
            aria-busy="true"
            aria-live="polite"
          />
        );
      }

      // Respaldo institucional sobrio si se agotan todos los reintentos silenciosos
      return (
        <div className="min-h-screen w-full bg-[#EFEBE0] text-[#1B1813] flex flex-col items-center justify-between p-6 select-none">
          <div />
          <div className="max-w-md w-full bg-[#FAF9F6] border border-[#8C7452]/30 rounded-3xl p-8 text-center shadow-[0_20px_50px_rgba(27,24,19,0.08)] space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#1B1813] text-[#EFEBE0] flex items-center justify-center mx-auto">
              <CaroniIsotype size={24} color="#8C7452" />
            </div>
            <div className="space-y-2">
              <span className="font-meta text-[10px] tracking-[0.24em] text-[#8C7452] uppercase font-semibold block">
                RESIDENCIAS CARONÍ · ALTAMIRA
              </span>
              <h1 className="font-display text-2xl text-[#1B1813]">
                Experiencia Arquitectónica Interactiva
              </h1>
              <p className="font-sans text-xs text-[#5A554A] leading-relaxed">
                Restableciendo la vista interactiva del proyecto.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleManualReset}
              className="w-full py-2.5 px-5 rounded-full bg-[#1B1813] hover:bg-[#8C7452] text-[#FAF9F6] font-meta text-[10px] uppercase tracking-[0.2em] transition-colors cursor-pointer"
            >
              Continuar Exploración
            </button>
          </div>
          <div className="text-[10px] font-meta tracking-widest text-[#8C8678] uppercase text-center">
            AÑIL ARQUITECTURA · ARQ. JUAN CARLOS LÁNCARA · DESARROLLO: ING. LUIS MARTINEZ
          </div>
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.recoveryKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}
