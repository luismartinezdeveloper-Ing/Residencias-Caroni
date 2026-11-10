import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, RefreshCw, X } from 'lucide-react';
import { RecoveryReason } from '../../hooks/useServiceRecoveryMonitor';

interface MaintenanceBannerProps {
  isVisible: boolean;
  reason: RecoveryReason;
  latencyMs?: number | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Banner de Mantenimiento y Modo de Recuperación — Residencias Caroní
 * Se despliega condicionalmente en MainAppContent cuando se detecta latencia extrema
 * o errores de servicio, informando que la plataforma opera con respaldo local activo.
 */
export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({
  isVisible,
  reason,
  latencyMs,
  onRetry,
  onDismiss,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-[72px] inset-x-0 z-[99985] px-3 sm:px-6 pointer-events-none flex justify-center"
        >
          <div className="pointer-events-auto w-full max-w-3xl bg-[#1B1813]/95 backdrop-blur-2xl border border-[#8C7452]/60 text-[#FAF9F6] px-4 py-2.5 rounded-2xl shadow-[0_14px_40px_rgba(0,0,0,0.45)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#8C7452]/20 border border-[#8C7452]/50 text-[#C9A86A] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-meta text-[10px] uppercase tracking-[0.2em] text-[#C9A86A] font-semibold">
                    Modo de Recuperación Activo
                  </span>
                  {reason === 'latency' && latencyMs ? (
                    <span className="font-mono text-[10px] text-[#A6A092]">
                      · Latencia alta ({latencyMs} ms)
                    </span>
                  ) : null}
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-[#EFEBE0] truncate">
                  {reason === 'latency'
                    ? 'Se detectó latencia elevada en la red. La plataforma opera con motor de respaldo local para garantizar fluidez.'
                    : 'Servicios externos en mantenimiento temporal. La experiencia opera en modo de recuperación local sin interrupciones.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="btn-apple btn-apple-dark px-2.5 py-1 font-meta text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  title="Verificar estado del servicio"
                  aria-label="Verificar estado del servicio"
                >
                  <RefreshCw className="w-3 h-3 text-[#C9A86A]" />
                  <span className="hidden sm:inline">Sincronizar</span>
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="w-7 h-7 rounded-full text-[#A6A092] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Ocultar aviso"
                  aria-label="Ocultar aviso de modo de recuperación"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
