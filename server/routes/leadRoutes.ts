import { Router } from 'express';
import { SignJWT } from 'jose';
import { sanitizeInput } from '../services/aiClient';
import { JWT_SECRET } from './authRoutes';
import { LeadRepository } from '../../src/services/leadRepository';

// Rate limiter for /api/leads (max 5 requests per IP per 60 seconds)
const LEADS_RATE_LIMIT_WINDOW_MS = 60000;
const LEADS_RATE_LIMIT_MAX = 5;
const leadsRateLimitMap = new Map<string, { count: number; windowStart: number }>();

function isLeadRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = leadsRateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > LEADS_RATE_LIMIT_WINDOW_MS) {
    leadsRateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > LEADS_RATE_LIMIT_MAX;
}

const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'sharklasers.com',
  'yopmail.com',
  'dispostable.com',
  'throwawaymail.com',
  'test.com',
  'example.com',
];

export function createLeadRouter(leadRepository: LeadRepository): Router {
  const router = Router();

  router.post('/api/leads', async (req, res) => {
    try {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';

      // 0. Rate Limiting — max 5 leads per IP per minute
      if (isLeadRateLimited(clientIp)) {
        return res.status(429).json({
          error: 'Demasiadas solicitudes. Por favor espere un momento antes de intentar de nuevo.',
        });
      }

      const {
        fullName,
        email,
        phone,
        countryCode,
        unitInterest,
        interestType,
        source,
        accreditationStatus,
        company_website,
      } = req.body;

      // 1. Silent Honeypot Trap for automated bots
      if (company_website && String(company_website).trim().length > 0) {
        console.warn(`[BOT BLOCKED] Detección de bot en /api/leads desde IP ${clientIp}`);
        return res.status(200).json({
          success: true,
          leadId: `LEAD-SIMULATED-${Date.now()}`,
          accessToken: 'simulated',
          synced: { gsheets: false, crm: false },
        });
      }

      if (!fullName || !email || !phone) {
        return res.status(400).json({
          error: 'Campos requeridos faltantes (Nombre, Correo o Teléfono).',
        });
      }

      // 2. Disposable Email Filter Server-Side
      const normalizedEmail = sanitizeInput(email).toLowerCase();
      const emailDomain = normalizedEmail.split('@')[1];
      if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
        return res.status(400).json({
          error: 'Por favor utilice una dirección de correo corporativa o personal válida (no temporal).',
        });
      }

      // 3. Sanity check for phone length
      const cleanedPhoneDigits = String(phone).replace(/\D/g, '');
      if (cleanedPhoneDigits.length < 7 || /^(\d)\1+$/.test(cleanedPhoneDigits)) {
        return res.status(400).json({
          error: 'El número de teléfono ingresado no corresponde a una línea válida.',
        });
      }

      const formattedPhone = countryCode
        ? `${sanitizeInput(countryCode)} ${sanitizeInput(phone)}`.trim()
        : sanitizeInput(phone);

      const leadEntry = {
        id: `LEAD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        fullName: sanitizeInput(fullName),
        email: normalizedEmail,
        phone: formattedPhone,
        countryCode: sanitizeInput(countryCode || '+58'),
        interestType: sanitizeInput(interestType || 'inversion'),
        unitInterest: sanitizeInput(unitInterest || 'General'),
        source: sanitizeInput(source || 'Hero Cinematic Funnel'),
        accreditationStatus: sanitizeInput(accreditationStatus || 'Accredited_Buyer'),
        timestamp: new Date().toISOString(),
        ip: clientIp,
      };

      // Persistir lead en el repositorio transaccional
      await leadRepository.saveLead({
        ...leadEntry,
        syncedGSheets: false,
        syncedCrm: false,
      });
      console.log(`[LEAD CAPTURED] ${leadEntry.fullName} (${leadEntry.email}) interesado en: ${leadEntry.unitInterest}`);

      // Dispatch to external Google Sheets Webhook server-side (with 4s atomic timeout)
      const gsheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      let gsheetsSynced = false;

      if (gsheetsWebhook && !gsheetsWebhook.includes('placeholder')) {
        try {
          const gsheetsRes = await fetch(gsheetsWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify({
              action: 'ADD_LEAD',
              leadId: leadEntry.id,
              timestamp: leadEntry.timestamp,
              fullName: leadEntry.fullName,
              email: leadEntry.email,
              phone: leadEntry.phone,
              interestType: leadEntry.interestType,
              preferredUnit: leadEntry.unitInterest,
              source: leadEntry.source,
              project: 'Residencias Caroní - Altamira',
            }),
          });
          gsheetsSynced = gsheetsRes.ok;
          if (gsheetsSynced) {
            await leadRepository.markSynced(leadEntry.id, 'gsheets');
          }
        } catch (gsheetsErr) {
          console.warn('Failed or timed out dispatching to GOOGLE_SHEETS_WEBHOOK_URL:', gsheetsErr);
        }
      }

      // Webhook integration for CRM (with 4s atomic timeout)
      let crmSynced = false;
      if (process.env.CRM_WEBHOOK_URL) {
        try {
          const crmRes = await fetch(process.env.CRM_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(4000),
            body: JSON.stringify(leadEntry),
          });
          crmSynced = crmRes.ok;
          if (crmSynced) {
            await leadRepository.markSynced(leadEntry.id, 'crm');
          }
        } catch (webhookErr) {
          console.warn('Failed or timed out dispatching to CRM_WEBHOOK_URL:', webhookErr);
        }
      }

      // Generate cryptographically signed JWT access token
      const verificationToken = await new SignJWT({
        id: leadEntry.id,
        email: leadEntry.email,
        type: 'lead_access',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(JWT_SECRET);

      return res.status(200).json({
        success: true,
        message: 'Acreditación registrada exitosamente. Acceso a planos y cotizaciones otorgado.',
        leadId: leadEntry.id,
        accessToken: verificationToken,
        synced: {
          gsheets: gsheetsSynced,
          crm: crmSynced,
        },
      });
    } catch (err: any) {
      console.error('Error processing /api/leads:', err);
      return res.status(500).json({ error: 'Error interno al procesar acreditación.' });
    }
  });

  return router;
}
