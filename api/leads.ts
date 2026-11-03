import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processLeadSubmission } from '../server/leads/processLead';
import { getClientIp, handleCors } from '../server/security/http';
import { rateLimit } from '../server/security/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  try {
    // Máximo 5 leads por IP por minuto
    const limit = await rateLimit('leads', getClientIp(req), 5, 60);
    if (!limit.allowed) {
      res.setHeader('Retry-After', String(limit.retryAfterSeconds));
      return res.status(429).json({
        error: 'Demasiadas solicitudes. Por favor espere un momento antes de intentar de nuevo.',
      });
    }

    const result = await processLeadSubmission(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error en Vercel Serverless /api/leads:', (error as Error).message);
    return res.status(500).json({ error: 'Error interno al procesar acreditación.' });
  }
}
