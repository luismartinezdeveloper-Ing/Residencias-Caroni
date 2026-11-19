import * as Sentry from '@sentry/react';

/**
 * Servicio Centralizado de Monitoreo de Errores & Telemetría — Residencias Caroní
 * Ingeniería de Software: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 *
 * Se inicializa de forma segura únicamente cuando existe VITE_SENTRY_DSN,
 * aplicando sanitización de datos sensibles (PII scrubbing) antes del envío.
 */

let isInitialized = false;
let isActive = false;

export interface ErrorMonitoringContext {
  componentStack?: string;
  boundary?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

function getSentryDsn(): string {
  try {
    const raw =
      typeof import.meta !== 'undefined' && import.meta.env
        ? (import.meta.env.VITE_SENTRY_DSN as string | undefined)
        : undefined;
    return typeof raw === 'string' ? raw.trim() : '';
  } catch {
    return '';
  }
}

function getSentryEnvironment(): string {
  try {
    const env =
      typeof import.meta !== 'undefined' && import.meta.env
        ? (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) ||
          (import.meta.env.MODE as string | undefined)
        : undefined;
    return env && env.trim().length > 0 ? env.trim() : 'production';
  } catch {
    return 'production';
  }
}

function getSentryTracesSampleRate(): number {
  try {
    const raw =
      typeof import.meta !== 'undefined' && import.meta.env
        ? (import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string | undefined)
        : undefined;
    if (!raw) return 0.2;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
      return parsed;
    }
    return 0.2;
  } catch {
    return 0.2;
  }
}

const SENSITIVE_KEY_PATTERN =
  /^(email|e-mail|correo|phone|tel|telefono|full_?name|nombre|vip_?code|access_?code|password|token|secret|authorization|cookie)$/i;

function scrubRecordPii(record: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      cleaned[key] = '[Filtered]';
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function scrubSensitiveEventData<T extends Sentry.ErrorEvent>(event: T): T {
  const sanitized = { ...event };

  if (sanitized.user) {
    const { email: _email, ip_address: _ip, username: _user, ...safeUser } = sanitized.user;
    sanitized.user = safeUser;
  }

  if (sanitized.request?.headers) {
    const cleanHeaders = { ...sanitized.request.headers };
    delete cleanHeaders.authorization;
    delete cleanHeaders.Authorization;
    delete cleanHeaders.cookie;
    delete cleanHeaders.Cookie;
    sanitized.request = {
      ...sanitized.request,
      headers: cleanHeaders,
    };
  }

  if (sanitized.extra) {
    sanitized.extra = scrubRecordPii(sanitized.extra as Record<string, unknown>);
  }

  if (Array.isArray(sanitized.breadcrumbs)) {
    sanitized.breadcrumbs = sanitized.breadcrumbs.map((crumb) =>
      crumb.data ? { ...crumb, data: scrubRecordPii(crumb.data) } : crumb
    );
  }

  return sanitized;
}

export function initErrorMonitoring(explicitDsn?: string): boolean {
  if (isInitialized) {
    return isActive;
  }
  isInitialized = true;

  const isJsdom =
    typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '');
  if (isJsdom && explicitDsn === undefined) {
    isActive = false;
    return false;
  }

  const dsn = typeof explicitDsn === 'string' ? explicitDsn.trim() : getSentryDsn();
  if (!dsn) {
    isActive = false;
    return false;
  }

  try {
    Sentry.init({
      dsn,
      environment: getSentryEnvironment(),
      release: 'residencias-caroni@1.0.0',
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: getSentryTracesSampleRate(),
      beforeSend(event) {
        return scrubSensitiveEventData(event);
      },
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'WebSocket closed without opened',
      ],
    });

    Sentry.setTag('project', 'residencias-caroni');
    Sentry.setTag('architecture', 'anil-arquitectura');
    Sentry.setTag('engineering', 'ing-luis-martinez');
    isActive = true;
    return true;
  } catch {
    isActive = false;
    return false;
  }
}

export function captureHandledException(
  error: unknown,
  context?: ErrorMonitoringContext
): void {
  if (!isActive) return;

  try {
    Sentry.withScope((scope) => {
      if (context?.boundary) {
        scope.setTag('error_boundary', context.boundary);
      }
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.componentStack) {
        scope.setContext('react', { componentStack: context.componentStack });
      }
      if (context?.extra) {
        scope.setExtras(context.extra);
      }
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    });
  } catch {
    // Nunca interrumpir la recuperación del UI por errores de telemetría
  }
}

export function captureTelemetryMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  extras?: Record<string, unknown>
): void {
  if (!isActive) return;

  try {
    Sentry.withScope((scope) => {
      if (extras) {
        scope.setExtras(extras);
      }
      Sentry.captureMessage(message, level);
    });
  } catch {
    // No-op seguro
  }
}

export function isErrorMonitoringActive(): boolean {
  return isActive;
}

export function __resetErrorMonitoringForTests(): void {
  isInitialized = false;
  isActive = false;
}
