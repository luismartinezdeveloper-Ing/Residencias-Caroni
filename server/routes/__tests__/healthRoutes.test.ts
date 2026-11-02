import { describe, it, expect, vi } from 'vitest';
import { createHealthRouter } from '../healthRoutes';
import { ILeadRepository, LeadRecord } from '../../../src/services/leadRepository';

describe('healthRoutes - Endpoint /api/health de Observabilidad y Telemetría', () => {
  const mockLeads: LeadRecord[] = [
    {
      id: 'LEAD-HEALTH-1',
      fullName: 'Inversor Beta',
      email: 'beta@inversion.com',
      phone: '+58 414 1112233',
      unitInterest: 'Penthouse Norte',
      accreditationStatus: 'Accredited_Buyer',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      syncedGSheets: true,
      syncedCrm: true,
    },
    {
      id: 'LEAD-HEALTH-2',
      fullName: 'Inversor Gamma',
      email: 'gamma@inversion.com',
      phone: '+58 414 4445566',
      unitInterest: 'PB Sur',
      accreditationStatus: 'Accredited_Buyer',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      syncedGSheets: false,
      syncedCrm: false,
      quarantineStatus: 'DLQ_MAX_RETRIES',
    },
  ];

  it('debe responder HTTP 200 con telemetría completa de memoria y métricas de leads en memoria', async () => {
    const mockRepo: ILeadRepository = {
      saveLead: vi.fn(),
      getAllLeads: vi.fn().mockResolvedValue(mockLeads),
      getUnsyncedLeads: vi.fn().mockResolvedValue([mockLeads[1]]),
      markSynced: vi.fn(),
      getQuarantineLeads: vi.fn().mockResolvedValue([mockLeads[1]]),
    };

    const router = createHealthRouter(mockRepo);
    const healthLayer = router.stack.find((layer: any) => layer.route?.path === '/api/health');
    expect(healthLayer).toBeDefined();

    const handler = healthLayer.route.stack[0].handle;

    let statusCode = 0;
    let jsonResult: any = null;
    const req = {} as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonResult = data;
        return res;
      },
    } as any;

    await handler(req, res);

    expect(statusCode).toBe(200);
    expect(jsonResult.status).toBe('ok');
    expect(jsonResult.service).toBe('Residencias Caroní · API Gateway');
    expect(jsonResult.metrics.leads.totalStored).toBe(2);
    expect(jsonResult.metrics.leads.pendingSync).toBe(1);
    expect(jsonResult.metrics.leads.inQuarantine).toBe(1);
    expect(jsonResult.metrics.memory.heapUsedMB).toBeGreaterThan(0);
    expect(jsonResult.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(jsonResult.metrics.liveVoice.endpoint).toBe('/api/live');
  });

  it('debe responder HTTP 500 si el repositorio de leads falla', async () => {
    const mockRepo: ILeadRepository = {
      saveLead: vi.fn(),
      getAllLeads: vi.fn().mockRejectedValue(new Error('Fallo crítico de I/O en almacenamiento')),
      getUnsyncedLeads: vi.fn().mockResolvedValue([]),
      markSynced: vi.fn(),
    };

    const router = createHealthRouter(mockRepo);
    const healthLayer = router.stack.find((layer: any) => layer.route?.path === '/api/health');
    const handler = healthLayer.route.stack[0].handle;

    let statusCode = 0;
    let jsonResult: any = null;
    const req = {} as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonResult = data;
        return res;
      },
    } as any;

    await handler(req, res);

    expect(statusCode).toBe(500);
    expect(jsonResult.status).toBe('error');
    expect(jsonResult.error).toContain('Fallo crítico de I/O');
  });
});
