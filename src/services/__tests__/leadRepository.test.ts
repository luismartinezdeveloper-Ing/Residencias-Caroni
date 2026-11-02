import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JsonFileLeadRepository, LeadRecord } from '../leadRepository';

describe('JsonFileLeadRepository - Almacenamiento Seguro y Transaccional', () => {
  const testDir = path.join(process.cwd(), 'scratch', 'test_leads');
  const testFile = path.join(testDir, 'leads_test.json');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('debe inicializar el archivo en disco si no existe y permitir guardar leads', async () => {
    const repo = new JsonFileLeadRepository(testFile, 10);
    const mockLead: LeadRecord = {
      id: 'LEAD-TEST-001',
      fullName: 'Carlos Mendoza',
      email: 'carlos@mendoza.com',
      phone: '+58 412 1234567',
      unitInterest: 'Unidad A · Nivel 1',
      accreditationStatus: 'Accredited_Buyer',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      syncedGSheets: false,
      syncedCrm: false,
    };

    await repo.saveLead(mockLead);

    expect(fs.existsSync(testFile)).toBe(true);
    const leads = await repo.getAllLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0].fullName).toBe('Carlos Mendoza');
  });

  it('debe marcar el estado de sincronización correctamente y persistirlo', async () => {
    const repo = new JsonFileLeadRepository(testFile, 10);
    const mockLead: LeadRecord = {
      id: 'LEAD-TEST-002',
      fullName: 'Valeria Gomez',
      email: 'valeria@gomez.com',
      phone: '+58 414 9876543',
      unitInterest: 'Penthouse Norte',
      accreditationStatus: 'Accredited_Buyer',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      syncedGSheets: false,
      syncedCrm: false,
    };

    await repo.saveLead(mockLead);
    const unsyncedBefore = await repo.getUnsyncedLeads();
    expect(unsyncedBefore).toHaveLength(1);

    await repo.markSynced('LEAD-TEST-002', 'gsheets');
    await repo.markSynced('LEAD-TEST-002', 'crm');

    const unsyncedAfter = await repo.getUnsyncedLeads();
    expect(unsyncedAfter).toHaveLength(0);

    // Reinstanciar el repo para verificar que leyó desde el disco
    const repoReloaded = new JsonFileLeadRepository(testFile, 10);
    const allLeads = await repoReloaded.getAllLeads();
    expect(allLeads[0].syncedGSheets).toBe(true);
    expect(allLeads[0].syncedCrm).toBe(true);
  });

  it('debe respetar el límite máximo de leads con rotación circular (FIFO)', async () => {
    const maxLimit = 3;
    const repo = new JsonFileLeadRepository(testFile, maxLimit);

    for (let i = 1; i <= 4; i++) {
      await repo.saveLead({
        id: `LEAD-00${i}`,
        fullName: `Comprador ${i}`,
        email: `lead${i}@test.com`,
        phone: '1234567',
        unitInterest: 'General',
        accreditationStatus: 'Accredited_Buyer',
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
      });
    }

    const leads = await repo.getAllLeads();
    expect(leads).toHaveLength(3);
    // El primero (LEAD-001) debió ser expulsado
    expect(leads[0].id).toBe('LEAD-002');
    expect(leads[2].id).toBe('LEAD-004');
  });

  it('debe manejar escrituras concurrentes sin colisión ni excepciones EPERM gracias al Mutex asíncrono', async () => {
    const repo = new JsonFileLeadRepository(testFile, 50);
    const writes = Array.from({ length: 20 }, (_, i) =>
      repo.saveLead({
        id: `LEAD-CONCURRENT-${i}`,
        fullName: `Inversionista Concurrente ${i}`,
        email: `concurrent${i}@inversor.com`,
        phone: '+58 414 1112233',
        unitInterest: 'Penthouse Norte',
        accreditationStatus: 'Accredited_Buyer',
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        syncedGSheets: false,
        syncedCrm: false,
      })
    );

    // Ejecutar todas las escrituras en paralelo
    await Promise.all(writes);

    const leads = await repo.getAllLeads();
    expect(leads).toHaveLength(20);
    expect(fs.existsSync(testFile)).toBe(true);
  });

  it('debe registrar y aislar leads en cuarentena DLQ_MAX_RETRIES', async () => {
    const repo = new JsonFileLeadRepository(testFile, 10);
    await repo.saveLead({
      id: 'LEAD-QUARANTINE-01',
      fullName: 'Cliente Fallido',
      email: 'fallido@test.com',
      phone: '+58 412 0001122',
      unitInterest: 'Jardín PB',
      accreditationStatus: 'Accredited_Buyer',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      syncedGSheets: false,
      syncedCrm: false,
    });

    const unsyncedBefore = await repo.getUnsyncedLeads();
    expect(unsyncedBefore).toHaveLength(1);

    await repo.markQuarantine('LEAD-QUARANTINE-01', 'Agotados 5 reintentos');

    // Debe salir de unsynced activos para no ciclar el bucle
    const unsyncedAfter = await repo.getUnsyncedLeads();
    expect(unsyncedAfter).toHaveLength(0);

    // Pero debe permanecer en la lista de cuarentena para auditoría forense
    const quarantined = await repo.getQuarantineLeads();
    expect(quarantined).toHaveLength(1);
    expect(quarantined[0].quarantineStatus).toBe('DLQ_MAX_RETRIES');
    expect(quarantined[0].quarantineReason).toBe('Agotados 5 reintentos');
  });
});
