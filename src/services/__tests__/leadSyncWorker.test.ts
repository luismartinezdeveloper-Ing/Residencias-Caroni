import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncPendingLeads, startLeadSyncWorker, _resetDlqTrackerForTesting } from '../leadSyncWorker';
import { ILeadRepository, LeadRecord } from '../leadRepository';

describe('leadSyncWorker - Reintentos Autónomos y Recuperación', () => {
  let mockRepo: ILeadRepository;
  let mockLeads: LeadRecord[];
  const originalEnv = process.env;

  beforeEach(() => {
    _resetDlqTrackerForTesting();
    process.env = {
      ...originalEnv,
      GOOGLE_SHEETS_WEBHOOK_URL: 'https://script.google.com/macros/s/test/exec',
      CRM_WEBHOOK_URL: 'https://crm.test.com/webhook',
    };

    mockLeads = [
      {
        id: 'LEAD-SYNC-1',
        fullName: 'Alejandro Carrillo',
        email: 'acarrillo@inversiones.com',
        phone: '+58 414 1112233',
        unitInterest: 'Penthouse Sur',
        accreditationStatus: 'Accredited_Buyer',
        timestamp: new Date().toISOString(),
        ip: '192.168.1.1',
        syncedGSheets: false,
        syncedCrm: false,
      },
    ];

    mockRepo = {
      saveLead: vi.fn(),
      getAllLeads: vi.fn().mockResolvedValue(mockLeads),
      getUnsyncedLeads: vi.fn().mockResolvedValue(mockLeads),
      markSynced: vi.fn().mockImplementation(async (id: string, target: 'gsheets' | 'crm') => {
        const lead = mockLeads.find((l) => l.id === id);
        if (lead) {
          if (target === 'gsheets') lead.syncedGSheets = true;
          if (target === 'crm') lead.syncedCrm = true;
        }
      }),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('debe reintentar el envío y marcar synced cuando las llamadas HTTP son exitosas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    }));

    const result = await syncPendingLeads(mockRepo);

    expect(result.attempted).toBe(1);
    expect(result.gsheetsSuccess).toBe(1);
    expect(result.crmSuccess).toBe(1);
    expect(result.dlqRescue).toBe(0);
    expect(mockRepo.markSynced).toHaveBeenCalledWith('LEAD-SYNC-1', 'gsheets');
    expect(mockRepo.markSynced).toHaveBeenCalledWith('LEAD-SYNC-1', 'crm');
  });

  it('debe manejar fallos de red sin romper la ejecución del worker', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection timeout')));

    const result = await syncPendingLeads(mockRepo);

    expect(result.attempted).toBe(1);
    expect(result.gsheetsSuccess).toBe(0);
    expect(result.crmSuccess).toBe(0);
    expect(mockRepo.markSynced).not.toHaveBeenCalled();
  });

  it('debe activar DLQ rescue después de 5 intentos fallidos consecutivos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Webhook down')));

    // Keep the lead unsynced across cycles by re-stubbing getUnsyncedLeads
    // The mock markSynced will set flags to true on DLQ, so we need to ensure
    // getUnsyncedLeads always returns the lead until DLQ fires
    let dlqResult: any = null;

    // Run sync cycles — DLQ triggers at attempt > 5 (i.e., attempt 6)
    for (let i = 0; i < 6; i++) {
      // Before each cycle, ensure the lead appears as unsynced
      mockLeads[0].syncedGSheets = false;
      mockLeads[0].syncedCrm = false;
      dlqResult = await syncPendingLeads(mockRepo);
      if (dlqResult.dlqRescue > 0) break;
    }

    expect(dlqResult.dlqRescue).toBe(1);
    expect(mockRepo.markSynced).toHaveBeenCalledWith('LEAD-SYNC-1', 'crm');
    expect(mockRepo.markSynced).toHaveBeenCalledWith('LEAD-SYNC-1', 'gsheets');
  });

  it('debe permitir iniciar y detener el worker limpiamente', () => {
    vi.useFakeTimers();
    const workerHandle = startLeadSyncWorker(mockRepo, 5000);

    expect(typeof workerHandle.stop).toBe('function');
    workerHandle.stop();
    vi.useRealTimers();
  });

  it('IT-05: debe prevenir ejecuciones concurrentes mediante el mutex isSyncInProgress', async () => {
    let resolveSlowFetch!: (value: any) => void;
    const slowFetchPromise = new Promise((resolve) => {
      resolveSlowFetch = resolve;
    });

    const fetchMock = vi.fn().mockReturnValue(slowFetchPromise);
    vi.stubGlobal('fetch', fetchMock);

    // Iniciar primer ciclo (queda bloqueado esperando slowFetchPromise)
    const firstCyclePromise = syncPendingLeads(mockRepo);

    // Intentar ejecutar un segundo ciclo concurrente mientras el primero sigue activo
    const secondCycleResult = await syncPendingLeads(mockRepo);
    expect(secondCycleResult.attempted).toBe(0);

    // Desbloquear el primer ciclo
    resolveSlowFetch({ ok: true, status: 200 });
    const firstCycleResult = await firstCyclePromise;
    expect(firstCycleResult.attempted).toBe(1);
    expect(firstCycleResult.gsheetsSuccess).toBe(1);
  });

  it('no debe incrementar intentos DLQ ni poner en cuarentena si no hay webhooks configurados', async () => {
    delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    delete process.env.CRM_WEBHOOK_URL;

    const markQuarantineMock = vi.fn();
    mockRepo.markQuarantine = markQuarantineMock;

    for (let i = 0; i < 8; i++) {
      const res = await syncPendingLeads(mockRepo);
      expect(res.attempted).toBe(0);
      expect(res.dlqRescue).toBe(0);
    }

    expect(markQuarantineMock).not.toHaveBeenCalled();
    expect(mockRepo.markSynced).not.toHaveBeenCalled();
  });
});
