import { useState, useEffect, useCallback } from 'react';

export type RecoveryReason = 'latency' | 'service_error' | null;

export interface LatencyPingSample {
  timestamp: string;
  latencyMs: number;
  status: 'ok' | 'high_latency' | 'error';
  isMobile: boolean;
  effectiveType?: string;
}

export interface ServiceRecoveryState {
  isInRecoveryMode: boolean;
  reason: RecoveryReason;
  latencyMs: number | null;
  latencyHistory: LatencyPingSample[];
  isUnstableMobile: boolean;
  dismissBanner: () => void;
  recheckNow: () => Promise<void>;
}

const EXTREME_LATENCY_THRESHOLD_MS = 2200;
const MOBILE_ELEVATED_LATENCY_MS = 1200;
const HEALTH_POLL_INTERVAL_MS = 45000;
export const LATENCY_HISTORY_STORAGE_KEY = 'caroni_latency_ping_history';
const MAX_LATENCY_SAMPLES = 5;

function detectMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) {
    return true;
  }
  return typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
}

/**
 * Recupera el historial de los últimos 5 estados de latencia (ping) desde localStorage.
 */
export function getStoredLatencyHistory(): LatencyPingSample[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LATENCY_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_LATENCY_SAMPLES);
  } catch {
    return [];
  }
}

/**
 * Registra un nuevo estado de latencia (ping) y conserva únicamente los últimos 5 registros
 * en localStorage para identificar patrones de conectividad inestable en dispositivos móviles.
 */
export function recordLatencyPingSample(
  latencyMs: number,
  status: 'ok' | 'high_latency' | 'error'
): LatencyPingSample[] {
  const navConnection = typeof navigator !== 'undefined' ? (navigator as any)?.connection : undefined;
  const sample: LatencyPingSample = {
    timestamp: new Date().toISOString(),
    latencyMs: Math.max(0, Math.round(latencyMs)),
    status,
    isMobile: detectMobileDevice(),
    effectiveType: navConnection?.effectiveType ? String(navConnection.effectiveType) : undefined,
  };

  const current = getStoredLatencyHistory();
  const updated = [...current, sample].slice(-MAX_LATENCY_SAMPLES);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LATENCY_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignorar silenciosamente si el almacenamiento está restringido (ej. modo incógnito estricto)
    }
  }

  return updated;
}

/**
 * Evalúa los últimos hasta 5 estados de ping para detectar patrones de conectividad
 * móvil inestable (múltiples caídas/picos o fluctuación severa de jitter).
 */
export function hasUnstableMobileConnectivity(samples: LatencyPingSample[]): boolean {
  if (samples.length < 2) return false;
  const recent = samples.slice(-MAX_LATENCY_SAMPLES);
  const mobileContext = recent.some((s) => s.isMobile) || detectMobileDevice();
  if (!mobileContext) return false;

  const degradedCount = recent.filter(
    (s) => s.status !== 'ok' || s.latencyMs >= MOBILE_ELEVATED_LATENCY_MS
  ).length;
  if (degradedCount >= 2) return true;

  // Detectar jitter severo (oscilación brusca >= 900ms entre pings consecutivos en móvil)
  for (let i = 1; i < recent.length; i++) {
    const delta = Math.abs(recent[i].latencyMs - recent[i - 1].latencyMs);
    if (delta >= 900 && recent[i].latencyMs >= 1000) {
      return true;
    }
  }

  return false;
}

/**
 * Emite un evento global para activar o desactivar el modo de recuperación
 * desde cualquier servicio de la aplicación (Chat, Voz, Leads, etc.).
 */
export function notifyServiceRecoveryMode(
  active: boolean,
  reason: RecoveryReason = 'service_error',
  latencyMs?: number
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('caroni:service-recovery', {
      detail: { active, reason, latencyMs: latencyMs ?? null },
    })
  );
}

export function useServiceRecoveryMonitor(): ServiceRecoveryState {
  const [isInRecoveryMode, setIsInRecoveryMode] = useState<boolean>(false);
  const [reason, setReason] = useState<RecoveryReason>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<LatencyPingSample[]>(() =>
    getStoredLatencyHistory()
  );
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const registerSampleAndEvaluate = useCallback(
    (ms: number, status: 'ok' | 'high_latency' | 'error') => {
      const updated = recordLatencyPingSample(ms, status);
      setLatencyHistory(updated);
      return hasUnstableMobileConnectivity(updated);
    },
    []
  );

  const probeHealth = useCallback(async () => {
    if (typeof window === 'undefined' || typeof fetch !== 'function') return;
    // Evitar sondeos de red artificiales dentro de entornos jsdom de test
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '')) {
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return;
    }

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - start);

      if (!response.ok || response.status >= 500) {
        registerSampleAndEvaluate(elapsed, 'error');
        setReason('service_error');
        setLatencyMs(elapsed);
        setIsInRecoveryMode(true);
        return;
      }

      const data = await response.json().catch(() => null);
      if (data && data.status === 'degraded') {
        registerSampleAndEvaluate(elapsed, 'error');
        setReason('service_error');
        setLatencyMs(elapsed);
        setIsInRecoveryMode(true);
        return;
      }

      const isHighLatency = elapsed >= EXTREME_LATENCY_THRESHOLD_MS;
      const unstableMobile = registerSampleAndEvaluate(
        elapsed,
        isHighLatency ? 'high_latency' : 'ok'
      );

      if (isHighLatency || unstableMobile) {
        setReason('latency');
        setLatencyMs(elapsed);
        setIsInRecoveryMode(true);
      } else {
        setIsInRecoveryMode(false);
        setReason(null);
        setLatencyMs(elapsed);
        setIsDismissed(false);
      }
    } catch {
      const elapsed = Math.round(performance.now() - start);
      const isLatencyTimeout = elapsed >= EXTREME_LATENCY_THRESHOLD_MS;
      registerSampleAndEvaluate(elapsed, isLatencyTimeout ? 'high_latency' : 'error');
      setReason(isLatencyTimeout ? 'latency' : 'service_error');
      setLatencyMs(elapsed);
      setIsInRecoveryMode(true);
    }
  }, [registerSampleAndEvaluate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Escuchar eventos explícitos de otros módulos de la plataforma
    const handleCustomRecoveryEvent = (event: Event) => {
      const custom = event as CustomEvent<{
        active: boolean;
        reason?: RecoveryReason;
        latencyMs?: number | null;
      }>;
      if (custom.detail?.active) {
        const reportedReason = custom.detail.reason || 'service_error';
        const reportedMs = custom.detail.latencyMs ?? null;
        if (typeof reportedMs === 'number') {
          registerSampleAndEvaluate(
            reportedMs,
            reportedReason === 'latency' ? 'high_latency' : 'error'
          );
        }
        setReason(reportedReason);
        setLatencyMs(reportedMs);
        setIsInRecoveryMode(true);
        setIsDismissed(false);
      } else {
        if (typeof custom.detail?.latencyMs === 'number') {
          registerSampleAndEvaluate(custom.detail.latencyMs, 'ok');
        }
        setIsInRecoveryMode(false);
        setReason(null);
        setIsDismissed(false);
      }
    };

    window.addEventListener('caroni:service-recovery', handleCustomRecoveryEvent);

    // 2. Monitorear Network Information API (navigator.connection) para latencia extrema
    const navConnection = (navigator as any)?.connection;
    const handleConnectionChange = () => {
      if (!navConnection) return;
      const rtt = typeof navConnection.rtt === 'number' ? navConnection.rtt : 0;
      const effectiveType = String(navConnection.effectiveType || '');
      const isDegraded = rtt >= 1500 || effectiveType === 'slow-2g';

      if (rtt > 0 || isDegraded) {
        const unstableMobile = registerSampleAndEvaluate(
          rtt || EXTREME_LATENCY_THRESHOLD_MS,
          isDegraded ? 'high_latency' : 'ok'
        );
        if (isDegraded || unstableMobile) {
          setReason('latency');
          setLatencyMs(rtt || null);
          setIsInRecoveryMode(true);
          return;
        }
      }

      if (reason === 'latency' && rtt > 0 && rtt < 600) {
        setIsInRecoveryMode(false);
        setReason(null);
      }
    };

    if (navConnection && typeof navConnection.addEventListener === 'function') {
      navConnection.addEventListener('change', handleConnectionChange);
      handleConnectionChange();
    }

    // 3. Sondeo periódico ligero de salud y latencia del backend
    const intervalId = window.setInterval(probeHealth, HEALTH_POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener('caroni:service-recovery', handleCustomRecoveryEvent);
      if (navConnection && typeof navConnection.removeEventListener === 'function') {
        navConnection.removeEventListener('change', handleConnectionChange);
      }
      window.clearInterval(intervalId);
    };
  }, [probeHealth, reason, registerSampleAndEvaluate]);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const isUnstableMobile = hasUnstableMobileConnectivity(latencyHistory);

  return {
    isInRecoveryMode: isInRecoveryMode && !isDismissed,
    reason,
    latencyMs,
    latencyHistory,
    isUnstableMobile,
    dismissBanner,
    recheckNow: probeHealth,
  };
}

