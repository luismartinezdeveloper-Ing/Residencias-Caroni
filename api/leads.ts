import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LeadPayload {
  fullName: string;
  email: string;
  phone: string;
  unitInterest?: string;
  accreditationStatus?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Options
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  try {
    const { fullName, email, phone, unitInterest, accreditationStatus } = req.body as LeadPayload;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes (Nombre, Correo o Teléfono).',
      });
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const leadEntry = {
      id: `LEAD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      unitInterest: unitInterest || 'General',
      accreditationStatus: accreditationStatus || 'Accredited_Buyer',
      timestamp: new Date().toISOString(),
      ip: clientIp,
    };

    console.log(`[VERCEL LEAD CAPTURED] ${leadEntry.fullName} (${leadEntry.email}) interesado en: ${leadEntry.unitInterest}`);

    // Optional dispatch to external CRM Webhook
    if (process.env.CRM_WEBHOOK_URL) {
      try {
        await fetch(process.env.CRM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadEntry),
        });
      } catch (webhookErr) {
        console.warn('Failed to dispatch lead to CRM_WEBHOOK_URL in Vercel function:', webhookErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Acreditación registrada exitosamente. Acceso a planos y cotizaciones otorgado.',
      leadId: leadEntry.id,
    });
  } catch (error: any) {
    console.error('Error en Vercel Serverless /api/leads:', error);
    return res.status(500).json({ error: 'Error interno al procesar acreditación.' });
  }
}
