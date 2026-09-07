export interface LeadRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  interestType: 'inversion' | 'vivienda' | 'family_office' | 'otro';
  preferredUnit?: string;
  source: string;
  timestamp: string;
  userAgent?: string;
  syncedToBackend?: boolean;
  accessToken?: string;
}

const STORAGE_KEY = 'caroni_lead_records';
const ACTIVE_LEAD_KEY = 'caroni_active_lead';
const OUTBOX_KEY = 'caroni_leads_outbox';

/**
 * Retrieves stored leads from localStorage
 */
export function getStoredLeads(): LeadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieves the currently authenticated lead from localStorage
 */
export function getActiveLead(): LeadRecord | null {
  try {
    const raw = localStorage.getItem(ACTIVE_LEAD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retrieves offline leads waiting in outbox queue
 */
export function getOutboxLeads(): LeadRecord[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOutboxLeads(leads: LeadRecord[]): void {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to save outbox leads to storage:', e);
  }
}

/**
 * Dispatches a lead directly to the backend /api/leads endpoint
 */
async function dispatchToBackend(lead: LeadRecord): Promise<{ success: boolean; accessToken?: string }> {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      countryCode: lead.countryCode,
      unitInterest: lead.preferredUnit || 'Residencias Caroní',
      interestType: lead.interestType,
      source: lead.source,
      accreditationStatus: 'Accredited_Lead',
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to register lead on backend`);
  }

  const data = await response.json();
  return {
    success: true,
    accessToken: data.accessToken,
  };
}

/**
 * Flushes pending outbox leads when connectivity is restored
 */
export async function flushOutboxQueue(): Promise<number> {
  const outbox = getOutboxLeads();
  if (outbox.length === 0) return 0;

  const remaining: LeadRecord[] = [];
  let flushedCount = 0;

  for (const lead of outbox) {
    try {
      const res = await dispatchToBackend(lead);
      if (res.success) {
        flushedCount++;
        // Update local records to synced
        lead.syncedToBackend = true;
        lead.accessToken = res.accessToken;
      } else {
        remaining.push(lead);
      }
    } catch {
      remaining.push(lead);
    }
  }

  saveOutboxLeads(remaining);
  return flushedCount;
}

// Auto-register online listener to flush pending leads
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOutboxQueue().then((count) => {
      if (count > 0) {
        console.log(`[OUTBOX SYNC] Sincronizados exitosamente ${count} leads pendientes.`);
      }
    });
  });
}

/**
 * Submits a new lead to backend & local cache with outbox resilience
 */
export async function submitLeadToGoogleSheets(lead: Omit<LeadRecord, 'id' | 'timestamp' | 'syncedToBackend'>): Promise<{
  success: boolean;
  lead: LeadRecord;
  synced: boolean;
  message?: string;
}> {
  const newLead: LeadRecord = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    syncedToBackend: false,
  };

  // 1. Store locally immediately
  const existing = getStoredLeads();
  existing.unshift(newLead);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  localStorage.setItem(ACTIVE_LEAD_KEY, JSON.stringify(newLead));
  localStorage.setItem('caroni_accredited', 'true');

  // 2. Dispatch to Backend API
  let synced = false;
  try {
    const res = await dispatchToBackend(newLead);
    synced = res.success;
    newLead.syncedToBackend = true;
    newLead.accessToken = res.accessToken;
    localStorage.setItem(ACTIVE_LEAD_KEY, JSON.stringify(newLead));
  } catch (networkErr) {
    console.warn('[OUTBOX] Conexión no disponible o servidor ocupado. Encolando en Outbox local:', networkErr);
    // Queue for subsequent background sync
    const outbox = getOutboxLeads();
    outbox.push(newLead);
    saveOutboxLeads(outbox);
  }

  return {
    success: true,
    lead: newLead,
    synced,
    message: synced
      ? 'Acreditación registrada exitosamente. Acceso a planos y cotizaciones otorgado.'
      : 'Datos guardados localmente. Se sincronizarán automáticamente al restablecerse la conexión.',
  };
}
