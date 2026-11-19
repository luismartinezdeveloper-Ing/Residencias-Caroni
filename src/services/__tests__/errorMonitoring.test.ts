import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Sentry from '@sentry/react';
import {
  initErrorMonitoring,
  captureHandledException,
  captureTelemetryMessage,
  isErrorMonitoringActive,
  scrubSensitiveEventData,
  __resetErrorMonitoringForTests,
} from '../errorMonitoring';

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  setTag: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: 'BrowserTracing' })),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((cb: (scope: { setTag: () => void; setContext: () => void; setExtras: () => void }) => void) =>
    cb({
      setTag: vi.fn(),
      setContext: vi.fn(),
      setExtras: vi.fn(),
    })
  ),
}));

describe('errorMonitoring (Sentry)', () => {
  beforeEach(() => {
    __resetErrorMonitoringForTests();
    vi.clearAllMocks();
  });

  it('se desactiva silenciosamente cuando no se provee VITE_SENTRY_DSN', () => {
    const active = initErrorMonitoring('');
    expect(active).toBe(false);
    expect(isErrorMonitoringActive()).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();

    captureHandledException(new Error('test'));
    captureTelemetryMessage('ping');
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it('inicializa Sentry cuando existe DSN y captura excepciones y mensajes', () => {
    const active = initErrorMonitoring('https://public@example.ingest.sentry.io/123');
    expect(active).toBe(true);
    expect(isErrorMonitoringActive()).toBe(true);
    expect(Sentry.init).toHaveBeenCalledTimes(1);

    captureHandledException(new Error('Render crash'), {
      boundary: 'GlobalErrorBoundary',
      componentStack: '<App />',
      tags: { retryCount: '0' },
    });
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);

    captureTelemetryMessage('High latency detected', 'warning', { latencyMs: 3200 });
    expect(Sentry.captureMessage).toHaveBeenCalledWith('High latency detected', 'warning');
  });

  it('elimina datos PII sensibles (email, ip, headers auth/cookie, extra y breadcrumbs) antes de enviar eventos', () => {
    const cleaned = scrubSensitiveEventData({
      user: {
        id: 'anon-1',
        email: 'vip@example.com',
        ip_address: '190.10.20.30',
        username: 'investor',
      },
      request: {
        headers: {
          authorization: 'Bearer secret',
          cookie: 'session=abc',
          'user-agent': 'vitest',
        },
      },
      extra: {
        email: 'privado@ejemplo.com',
        phone: '+584141112233',
        unitId: 'jardin-norte',
      },
      breadcrumbs: [
        {
          message: 'Lead submit',
          data: { vipCode: 'CARONI-VIP', unit: 'Mirador Sur' },
        },
      ],
    } as unknown as Sentry.ErrorEvent);

    expect(cleaned.user).toEqual({ id: 'anon-1' });
    expect(cleaned.request?.headers).toEqual({ 'user-agent': 'vitest' });
    expect(cleaned.extra).toEqual({
      email: '[Filtered]',
      phone: '[Filtered]',
      unitId: 'jardin-norte',
    });
    expect(cleaned.breadcrumbs?.[0]?.data).toEqual({
      vipCode: '[Filtered]',
      unit: 'Mirador Sur',
    });
  });

  it('mantiene inicialización idempotente al invocarse múltiples veces', () => {
    expect(initErrorMonitoring('https://public@example.ingest.sentry.io/456')).toBe(true);
    expect(initErrorMonitoring('https://public@example.ingest.sentry.io/789')).toBe(true);
    expect(Sentry.init).toHaveBeenCalledTimes(1);
    expect(Sentry.setTag).toHaveBeenCalledWith('engineering', 'ing-luis-martinez');
  });
});
