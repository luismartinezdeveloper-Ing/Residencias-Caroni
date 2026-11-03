/**
 * Procesamiento de leads en el servidor (usado por la función serverless /api/leads).
 * Valida con las mismas reglas que el formulario, despacha a los webhooks con timeout
 * y solo confirma al cliente si el lead llegó a algún destino configurado.
 */

import { SignJWT } from 'jose';
import { getJwtSecret } from '../security/auth';
import { sanitizeInput } from '../services/aiClient';
import { validateEmailAddress, validateFullName, validatePhoneNumber } from '../../src/utils/leadValidation';

const WEBHOOK_TIMEOUT_MS = 4000;
const MAX_FIELD_CHARS = 120;

export interface LeadResponse {
  status: number;
  body: Record<string, unknown>;
}

export interface LeadEntry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  interestType: string;
  unitInterest: string;
  source: string;
  accreditationStatus: string;
  timestamp: string;
}

function field(value: unknown, fallback: string): string {
  const clean = sanitizeInput(String(value ?? '')).slice(0, MAX_FIELD_CHARS);
  return clean || fallback;
}

export function validateLeadPayload(body: unknown): { lead?: LeadEntry; error?: string } {
  const data = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const countryCode = /^\+\d{1,4}$/.test(String(data.countryCode ?? '')) ? String(data.countryCode) : '+58';
  const name = validateFullName(sanitizeInput(String(data.fullName ?? '')).slice(0, MAX_FIELD_CHARS));
  if (!name.isValid) return { error: name.error };
  const email = validateEmailAddress(String(data.email ?? '').slice(0, 254));
  if (!email.isValid) return { error: email.error };
  const phone = validatePhoneNumber(String(data.phone ?? '').slice(0, 32), countryCode);
  if (!phone.isValid) return { error: phone.error };

  return {
    lead: {
      id: `LEAD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      fullName: name.sanitizedValue!,
      email: email.sanitizedValue!,
      phone: `${countryCode} ${phone.sanitizedValue}`,
      countryCode,
      interestType: field(data.interestType, 'inversion'),
      unitInterest: field(data.unitInterest, 'General'),
      source: field(data.source, 'Hero Cinematic Funnel'),
      accreditationStatus: field(data.accreditationStatus, 'Accredited_Lead'),
      timestamp: new Date().toISOString(),
    },
  };
}

async function postWebhook(url: string, payload: unknown): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function processLeadSubmission(
  body: unknown,
  env: NodeJS.ProcessEnv = process.env
): Promise<LeadResponse> {
  // Honeypot: los bots rellenan el campo oculto; se responde éxito simulado sin procesar.
  const honeypot = (body as Record<string, unknown> | null)?.company_website;
  if (honeypot && String(honeypot).trim().length > 0) {
    console.warn('[BOT BLOCKED] Honeypot activado en /api/leads');
    return { status: 200, body: { success: true, leadId: `LEAD-SIMULATED-${Date.now()}` } };
  }

  const { lead, error } = validateLeadPayload(body);
  if (!lead) {
    return { status: 400, body: { error } };
  }

  const gsheetsUrl = env.GOOGLE_SHEETS_WEBHOOK_URL;
  const crmUrl = env.CRM_WEBHOOK_URL;
  const destinations: Array<Promise<boolean>> = [];

  if (gsheetsUrl && !gsheetsUrl.includes('placeholder')) {
    destinations.push(
      postWebhook(gsheetsUrl, {
        action: 'ADD_LEAD',
        leadId: lead.id,
        timestamp: lead.timestamp,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        interestType: lead.interestType,
        preferredUnit: lead.unitInterest,
        source: lead.source,
        project: 'Residencias Caroní - Altamira',
      })
    );
  }
  if (crmUrl) {
    destinations.push(postWebhook(crmUrl, lead));
  }

  const results = await Promise.all(destinations);
  const delivered = results.some(Boolean);

  if (destinations.length === 0) {
    console.warn(`[LEADS] ${lead.id}: no hay GOOGLE_SHEETS_WEBHOOK_URL ni CRM_WEBHOOK_URL configurados; el lead no se almacena.`);
  } else if (!delivered) {
    console.error(`[LEADS] ${lead.id}: fallaron todos los webhooks; el cliente lo reintentará.`);
    return {
      status: 502,
      body: { error: 'No pudimos registrar su solicitud en este momento. Se reintentará automáticamente.' },
    };
  }

  console.log(`[LEAD CAPTURED] ${lead.id} interesado en: ${lead.unitInterest}`);

  const accessToken = await new SignJWT({ id: lead.id, email: lead.email, type: 'lead_access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getJwtSecret(env));

  return {
    status: 200,
    body: {
      success: true,
      message: 'Acreditación registrada exitosamente. Acceso a planos y cotizaciones otorgado.',
      leadId: lead.id,
      accessToken,
    },
  };
}
