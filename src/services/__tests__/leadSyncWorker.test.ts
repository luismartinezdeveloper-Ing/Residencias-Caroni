import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncPendingLeads, startLeadSyncWorker } from '../leadSyncWorker';
import { ILeadRepository, LeadRecord } from '../leadRepository';

describe('leadSyncWorker - Reintentos Autónomos y Recuperación', () => {
  let mockRepo: ILeadRepository;
  let mockLeads: LeadRecord[];
  const originalEnv = process.env;

  beforeEach(() => {
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

  it('debe permitir iniciar y detener el worker limpiamente', () => {
    vi.useFakeTimers();
    const workerHandle = startLeadSyncWorker(mockRepo, 5000);

    expect(typeof workerHandle.stop).toBe('function');
    workerHandle.stop();
    vi.useRealTimers();
  });
});
