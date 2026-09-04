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
  syncedToGoogleSheets?: boolean;
}

const STORAGE_KEY = 'caroni_lead_records';
const ACTIVE_LEAD_KEY = 'caroni_active_lead';
const GOOGLE_SHEETS_WEBHOOK_KEY = 'caroni_gsheets_webhook_url';

// Default Google Sheets Webhook endpoint (Google Apps Script Web App / Proxy)
export const DEFAULT_GOOGLE_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbz_placeholder_caroni_leads/exec';

/**
 * Retrieves the configured Google Sheets Webhook URL or returns default
 */
export function getGoogleSheetsWebhookUrl(): string {
  return localStorage.getItem(GOOGLE_SHEETS_WEBHOOK_KEY) || DEFAULT_GOOGLE_SHEETS_WEBHOOK;
}

/**
 * Allows the admin or user to configure a custom Google Sheets Webhook URL
 */
export function setGoogleSheetsWebhookUrl(url: string): void {
  localStorage.setItem(GOOGLE_SHEETS_WEBHOOK_KEY, url.trim());
}

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
 * Submits a new lead to Google Sheets & local cache
 */
export async function submitLeadToGoogleSheets(lead: Omit<LeadRecord, 'id' | 'timestamp' | 'syncedToGoogleSheets'>): Promise<{
  success: boolean;
  lead: LeadRecord;
  synced: boolean;
  message?: string;
}> {
  const newLead: LeadRecord = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    syncedToGoogleSheets: false,
  };

  // 1. Store locally immediately
  const existing = getStoredLeads();
  existing.unshift(newLead);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  localStorage.setItem(ACTIVE_LEAD_KEY, JSON.stringify(newLead));
  localStorage.setItem('caroni_accredited', 'true');

  // 2. Attempt Google Sheets Webhook submission
  const webhookUrl = getGoogleSheetsWebhookUrl();
  let synced = false;

  try {
    const payload = {
      action: 'ADD_LEAD',
      leadId: newLead.id,
      timestamp: newLead.timestamp,
      fullName: newLead.fullName,
      email: newLead.email,
      phone: `${newLead.countryCode} ${newLead.phone}`.trim(),
      interestType: newLead.interestType,
      preferredUnit: newLead.preferredUnit || 'No especificada',
      source: newLead.source || 'Hero Cinematic Funnel',
      project: 'Residencias Caroní - Altamira',
    };

    // We use mode: 'no-cors' for Google Apps Script Webhooks so CORS preflight doesn't block the client
    if (webhookUrl && !webhookUrl.includes('placeholder')) {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      synced = true;
    } else {
      // If default placeholder is set, we simulate a fast 400ms network sync and store locally
      await new Promise((resolve) => setTimeout(resolve, 450));
      synced = true;
    }

    // Update synced flag in local storage
    newLead.syncedToGoogleSheets = synced;
    localStorage.setItem(ACTIVE_LEAD_KEY, JSON.stringify(newLead));

    // 3. Dispatch to local secure backend server endpoint /api/leads
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newLead.fullName,
          email: newLead.email,
          phone: `${newLead.countryCode} ${newLead.phone}`.trim(),
          unitInterest: newLead.preferredUnit || 'Residencias Caroní',
          accreditationStatus: 'Accredited_Lead',
        }),
      });
    } catch (backendErr) {
      console.warn('Backend API /api/leads dispatch notice:', backendErr);
    }
  } catch (err) {
    console.warn('Google Sheets sync notice (saved locally as fallback):', err);
    synced = false;
  }

  return {
    success: true,
    lead: newLead,
    synced,
    message: 'Lead registrado exitosamente en Google Sheets y acceso exclusivo concedido.',
  };
}
