/**
 * Servicio de Analítica & Tracking de Conversión — Residencias Caroní
 * Ingeniería de Software: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 *
 * Registra hitos del embudo del inversionista sin recolectar PII:
 * 1. Google Analytics 4 (opcional si VITE_GA_MEASUREMENT_ID está definido)
 * 2. Plausible Analytics (opcional si VITE_PLAUSIBLE_DOMAIN está definido)
 * 3. Telemetría first-party ligera (/api/analytics vía sendBeacon) + anillo local en localStorage
 */

export type ConversionEventName =
  | 'page_view'
  | 'section_view'
  | 'lead_gate_open'
  | 'lead_gate_submit'
  | 'vip_code_verified'
  | 'model_3d_open'
  | 'model_3d_view_mode'
  | 'unit_selected'
  | 'advisor_open'
  | 'advisor_message_sent'
  | 'cta_schedule_click'
  | 'cta_whatsapp_click'
  | 'locale_change'
  | 'video_adaptive_stream';

export interface AnalyticsRecord {
  event: ConversionEventName;
  timestamp: string;
  props?: Record<string, string | number | boolean>;
}

const STORAGE_KEY = 'caroni_analytics_funnel';
const MAX_LOCAL_RECORDS = 40;
let isAnalyticsInitialized = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

function isDoNotTrackEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const dnt =
    navigator.doNotTrack ||
    (window as unknown as { doNotTrack?: string }).doNotTrack ||
    (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

function sanitizeProps(
  props?: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean> | undefined {
  if (!props) return undefined;
  const clean: Record<string, string | number | boolean> = {};
  const blockedKeys = /email|phone|name|tel|correo|nombre|token|code|secret|password/i;

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || blockedKeys.test(key)) continue;
    clean[key] = typeof value === 'string' ? value.slice(0, 80) : value;
  }

  return Object.keys(clean).length > 0 ? clean : undefined;
}

function persistLocalFunnelRecord(record: AnalyticsRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: AnalyticsRecord[] = raw ? JSON.parse(raw) : [];
    const safeList = Array.isArray(parsed) ? parsed : [];
    const updated = [...safeList, record].slice(-MAX_LOCAL_RECORDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // No bloquear UX por cuotas de almacenamiento
  }
}

export function initAnalytics(): void {
  if (isAnalyticsInitialized || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  isAnalyticsInitialized = true;

  if (isDoNotTrackEnabled()) {
    return;
  }

  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined;
  const gaId = (env?.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();
  const plausibleDomain = (env?.VITE_PLAUSIBLE_DOMAIN as string | undefined)?.trim();

  if (gaId && /^G-[A-Z0-9]+$/i.test(gaId) && !document.getElementById('caroni-ga4-script')) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { anonymize_ip: true, send_page_view: true });

    const script = document.createElement('script');
    script.id = 'caroni-ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);
  }

  if (plausibleDomain && !document.getElementById('caroni-plausible-script')) {
    const script = document.createElement('script');
    script.id = 'caroni-plausible-script';
    script.defer = true;
    script.setAttribute('data-domain', plausibleDomain);
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }
}

export function trackConversionEvent(
  event: ConversionEventName,
  rawProps?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === 'undefined' || isDoNotTrackEnabled()) {
    return;
  }

  const props = sanitizeProps(rawProps);
  const record: AnalyticsRecord = {
    event,
    timestamp: new Date().toISOString(),
    ...(props ? { props } : {}),
  };

  persistLocalFunnelRecord(record);

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, props || {});
    }
    if (typeof window.plausible === 'function') {
      window.plausible(event, props ? { props } : undefined);
    }
  } catch {
    // No-op seguro si scripts externos están bloqueados
  }

  // En ambientes jsdom de prueba omitir llamadas de red reales
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '')) {
    return;
  }

  try {
    const payload = JSON.stringify(record);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics', blob);
    } else if (typeof fetch === 'function') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Nunca afectar el hilo principal por telemetría
  }
}

export function getFunnelSummary(): Record<string, number> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: AnalyticsRecord[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return {};
    return list.reduce<Record<string, number>>((acc, item) => {
      if (item && typeof item.event === 'string') {
        acc[item.event] = (acc[item.event] || 0) + 1;
      }
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function clearLocalAnalyticsFunnel(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No-op
  }
}
