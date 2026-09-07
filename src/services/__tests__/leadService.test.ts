// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// @vitest-environment jsdom
import { submitLeadToGoogleSheets, getStoredLeads, getOutboxLeads, flushOutboxQueue } from '../leadService';

describe('leadService - Offline Outbox & Dual-Sync', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe registrar un lead localmente y despacharlo exitosamente al backend', async () => {
    const mockAccessToken = 'token_test_12345';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        leadId: 'LEAD-1234',
        accessToken: mockAccessToken,
      }),
    }));

    const result = await submitLeadToGoogleSheets({
      fullName: 'Carlos Mendoza',
      email: 'carlos.mendoza@familyoffice.com',
      phone: '4141234567',
      countryCode: '+58',
      interestType: 'family_office',
      source: 'Hero Funnel',
    });

    expect(result.success).toBe(true);
    expect(result.synced).toBe(true);
    expect(result.lead.accessToken).toBe(mockAccessToken);

    const stored = getStoredLeads();
    expect(stored).toHaveLength(1);
    expect(stored[0].fullName).toBe('Carlos Mendoza');
    expect(localStorage.getItem('caroni_accredited')).toBe('true');
  });

  it('debe encolar en Outbox cuando el backend no está disponible por caída de red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

    const result = await submitLeadToGoogleSheets({
      fullName: 'Valeria Gomez',
      email: 'valeria@patrimonio.ch',
      phone: '791234567',
      countryCode: '+41',
      interestType: 'inversion',
      source: 'Test Offline',
    });

    expect(result.success).toBe(true);
    expect(result.synced).toBe(false); // No sincronizado inmediatamente
    expect(localStorage.getItem('caroni_accredited')).toBe('true'); // Permite acceso local al inversor

    const outbox = getOutboxLeads();
    expect(outbox).toHaveLength(1);
    expect(outbox[0].fullName).toBe('Valeria Gomez');
  });

  it('debe vaciar y sincronizar la cola Outbox con flushOutboxQueue() al recuperar conectividad', async () => {
    // 1. Simular lead que falló y quedó en Outbox
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network offline')));
    await submitLeadToGoogleSheets({
      fullName: 'Alejandro Silva',
      email: 'asilva@inversiones.com',
      phone: '4120001122',
      countryCode: '+58',
      interestType: 'inversion',
      source: 'Test Outbox Flush',
    });

    expect(getOutboxLeads()).toHaveLength(1);

    // 2. Conectividad recuperada: backend responde 200
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, accessToken: 'token_flushed' }),
    }));

    const flushedCount = await flushOutboxQueue();
    expect(flushedCount).toBe(1);
    expect(getOutboxLeads()).toHaveLength(0); // Cola vacía
  });
});
