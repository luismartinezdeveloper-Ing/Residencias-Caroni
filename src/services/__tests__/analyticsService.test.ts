// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackConversionEvent,
  getFunnelSummary,
  clearLocalAnalyticsFunnel,
} from '../analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    clearLocalAnalyticsFunnel();
    window.gtag = undefined;
    window.plausible = undefined;
  });

  it('registra eventos del embudo en localStorage y calcula el resumen', () => {
    trackConversionEvent('page_view', { locale: 'es' });
    trackConversionEvent('lead_gate_open', { unitId: 'jardin-norte', mode: 'assembled' });
    trackConversionEvent('lead_gate_submit', { typology: 'Jardín' });

    const summary = getFunnelSummary();
    expect(summary.page_view).toBe(1);
    expect(summary.lead_gate_open).toBe(1);
    expect(summary.lead_gate_submit).toBe(1);
  });

  it('elimina campos PII (email, phone, name, token) de las propiedades almacenadas', () => {
    trackConversionEvent('lead_gate_submit', {
      typology: 'Mirador',
      email: 'secreto@correo.com',
      phone: '+584121234567',
      fullName: 'Persona Privada',
      vipCode: 'CARONI-VIP-1',
    });

    const raw = window.localStorage.getItem('caroni_analytics_funnel') || '';
    expect(raw).toContain('Mirador');
    expect(raw).not.toContain('secreto@correo.com');
    expect(raw).not.toContain('+584121234567');
    expect(raw).not.toContain('Persona Privada');
    expect(raw).not.toContain('CARONI-VIP-1');
  });

  it('respeta navigator.doNotTrack cuando está activo en "1"', () => {
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      configurable: true,
    });

    trackConversionEvent('cta_schedule_click', { location: 'cta_section' });
    expect(getFunnelSummary()).toEqual({});

    Object.defineProperty(navigator, 'doNotTrack', {
      value: null,
      configurable: true,
    });
  });
});
