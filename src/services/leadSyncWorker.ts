/**
 * Worker Autónomo de Sincronización y Recuperación de Leads
 * Residencias Caroní · Altamira, Caracas
 * Arquitectura: Añil Arquitectura — Arq. Juan Carlos Láncara
 * Ingeniería de Software: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 */

import { ILeadRepository, LeadRecord } from './leadRepository';

export interface SyncCycleResult {
  attempted: number;
  gsheetsSuccess: number;
  crmSuccess: number;
  dlqRescue: number;
}

// Mapa en memoria para contar intentos por Lead y evitar loops infinitos (DLQ Tracker)
const dlqAttemptsTracker = new Map<string, number>();

export function _resetDlqTrackerForTesting(): void {
  dlqAttemptsTracker.clear();
}

/**
 * Ejecuta un ciclo de recuperación sobre los leads no sincronizados
 */
export async function syncPendingLeads(repo: ILeadRepository): Promise<SyncCycleResult> {
  const result: SyncCycleResult = {
    attempted: 0,
    gsheetsSuccess: 0,
    crmSuccess: 0,
    dlqRescue: 0,
  };

  try {
    const unsyncedLeads = await repo.getUnsyncedLeads();
    if (unsyncedLeads.length === 0) {
      return result;
    }

    result.attempted = unsyncedLeads.length;
    const gsheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const crmWebhook = process.env.CRM_WEBHOOK_URL;
    const rescueWebhook = process.env.EMERGENCY_RESCUE_WEBHOOK_URL;

    for (const lead of unsyncedLeads) {
      const attempts = (dlqAttemptsTracker.get(lead.id) || 0) + 1;
      dlqAttemptsTracker.set(lead.id, attempts);

      // Dead-Letter Queue Rescue: Si falla más de 5 veces, activar rescate DLQ
      if (attempts > 5) {
        console.warn(`[LEAD-SYNC-RECOVERY] Lead ${lead.id} ha fallado 5 veces. Activando rescate DLQ...`);
        let rescued = false;
        if (rescueWebhook) {
          try {
            const rescueRes = await fetch(rescueWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(5000),
              body: JSON.stringify({ reason: 'DLQ_MAX_RETRIES', lead }),
            });
            if (rescueRes.ok) {
              console.log(`[LEAD-SYNC-RECOVERY] Rescate exitoso para Lead ${lead.id}`);
              rescued = true;
            }
          } catch (rescueErr) {
            console.error(`[LEAD-SYNC-RECOVERY] CRÍTICO: Falló el rescate DLQ para Lead ${lead.id}`, rescueErr);
          }
        } else {
          console.error(`[LEAD-SYNC-RECOVERY] CRÍTICO: No hay EMERGENCY_RESCUE_WEBHOOK_URL configurado. Volcado de Lead ${lead.id}:`, JSON.stringify(lead));
        }

        // Preservar en cuarentena con auditoría explícita
        if (typeof repo.markQuarantine === 'function') {
          await repo.markQuarantine(
            lead.id,
            rescued
              ? 'Rescatado via Emergency Rescue Webhook'
              : 'Agotados 5 reintentos sin confirmación externa de webhook'
          );
        }

        // Marcar en cola para evitar saturación del bucle
        await repo.markSynced(lead.id, 'crm');
        await repo.markSynced(lead.id, 'gsheets');
        dlqAttemptsTracker.delete(lead.id);
        result.dlqRescue++;
        continue;
      }

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
          console.error(`[LEAD-SYNC-RECOVERY] Reintento fallido para ${lead.id} hacia Google Sheets:`, err);
        }
      }

      // 2. Reintento CRM Webhook
      if (
        lead.syncedCrm === false &&
        crmWebhook &&
        !crmWebhook.includes('placeholder')
      ) {
        try {
          const res = await fetch(crmWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify({
              leadId: lead.id,
              fullName: lead.fullName,
              email: lead.email,
              phone: lead.phone,
              unitInterest: lead.unitInterest,
              accreditationStatus: lead.accreditationStatus,
              timestamp: lead.timestamp,
              source: lead.source || 'Sync Worker Recovery',
            }),
          });
          if (res.ok) {
            await repo.markSynced(lead.id, 'crm');
            result.crmSuccess++;
            console.log(`[LEAD-SYNC-RECOVERY] Lead ${lead.id} sincronizado exitosamente con CRM.`);
          }
        } catch (err) {
          console.error(`[LEAD-SYNC-RECOVERY] Reintento fallido para ${lead.id} hacia CRM:`, err);
        }
      }
    }
  } catch (error) {
    console.error('[LEAD-SYNC-RECOVERY] Error crítico en ciclo de sincronización:', error);
  }

  return result;
}

/**
 * Arranca el worker recurrente en segundo plano
 */
export function startLeadSyncWorker(repo: ILeadRepository, intervalMs: number = 60000) {
  console.log(`[LEAD-SYNC-RECOVERY] Worker de sincronización en segundo plano iniciado (intervalo: ${intervalMs / 1000}s).`);

  const timer = setInterval(async () => {
    await syncPendingLeads(repo);
  }, intervalMs);

  return {
    stop: () => {
      clearInterval(timer);
      console.log('[LEAD-SYNC-RECOVERY] Worker de sincronización detenido limpiamente.');
    },
  };
}
