/**
 * Worker Autónomo de Sincronización y Recuperación de Leads
 * Residencias Caroní · Altamira, Caracas
 * Ingeniería de Software: Ing. Luis Martinez
 */

import { ILeadRepository, LeadRecord } from './leadRepository';

export interface SyncCycleResult {
  attempted: number;
  gsheetsSuccess: number;
  crmSuccess: number;
}

/**
 * Ejecuta un ciclo de recuperación sobre los leads no sincronizados
 */
export async function syncPendingLeads(repo: ILeadRepository): Promise<SyncCycleResult> {
  const result: SyncCycleResult = {
    attempted: 0,
    gsheetsSuccess: 0,
    crmSuccess: 0,
  };

  try {
    const unsyncedLeads = await repo.getUnsyncedLeads();
    if (unsyncedLeads.length === 0) {
      return result;
    }

    result.attempted = unsyncedLeads.length;
    const gsheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const crmWebhook = process.env.CRM_WEBHOOK_URL;

    for (const lead of unsyncedLeads) {
      // 1. Reintento Google Sheets Webhook
      if (
        lead.syncedGSheets === false &&
        gsheetsWebhook &&
        !gsheetsWebhook.includes('placeholder')
      ) {
        try {
          const res = await fetch(gsheetsWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify({
              action: 'ADD_LEAD',
              leadId: lead.id,
              timestamp: lead.timestamp,
              fullName: lead.fullName,
              email: lead.email,
              phone: lead.phone,
              interestType: lead.interestType || 'inversion',
              preferredUnit: lead.unitInterest,
              source: lead.source || 'Sync Worker Recovery',
              project: 'Residencias Caroní - Altamira',
            }),
          });

          if (res.ok) {
            await repo.markSynced(lead.id, 'gsheets');
            result.gsheetsSuccess++;
            console.log(`[LEAD-SYNC-RECOVERY] Lead ${lead.id} sincronizado exitosamente con Google Sheets.`);
          }
        } catch (err) {
          console.warn(`[LEAD-SYNC-RECOVERY] Reintento fallido para ${lead.id} hacia Google Sheets:`, err);
        }
      }

      // 2. Reintento CRM Webhook
      if (lead.syncedCrm === false && crmWebhook) {
        try {
          const res = await fetch(crmWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify(lead),
          });

          if (res.ok) {
            await repo.markSynced(lead.id, 'crm');
            result.crmSuccess++;
            console.log(`[LEAD-SYNC-RECOVERY] Lead ${lead.id} sincronizado exitosamente con CRM.`);
          }
        } catch (err) {
          console.warn(`[LEAD-SYNC-RECOVERY] Reintento fallido para ${lead.id} hacia CRM:`, err);
        }
      }
    }
  } catch (outerErr) {
    console.error('[LEAD-SYNC-RECOVERY] Error crítico en ciclo de sincronización:', outerErr);
  }

  return result;
}

/**
 * Inicia el temporizador en segundo plano para el reintento periódico
 */
export function startLeadSyncWorker(repo: ILeadRepository, intervalMs: number = 60000): { stop: () => void } {
  console.log(`[LEAD-SYNC-RECOVERY] Worker de sincronización en segundo plano iniciado (intervalo: ${intervalMs / 1000}s).`);

  let isRunning = true;
  let timerId: NodeJS.Timeout | null = null;

  const scheduleNext = () => {
    if (!isRunning) return;
    timerId = setTimeout(async () => {
      if (!isRunning) return;
      await syncPendingLeads(repo);
      scheduleNext();
    }, intervalMs);
  };

  scheduleNext();

  return {
    stop: () => {
      isRunning = false;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      console.log('[LEAD-SYNC-RECOVERY] Worker de sincronización detenido limpiamente.');
    },
  };
}
