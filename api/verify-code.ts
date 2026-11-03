import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT } from 'jose';
import { getJwtSecret, isValidAccessCode, normalizeAccessCode } from '../server/security/auth';
import { getClientIp, handleCors } from '../server/security/http';
import { rateLimit } from '../server/security/rateLimit';
import { sanitizeInput } from '../server/services/aiClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
  }

  try {
    // Anti fuerza bruta: 10 intentos por IP cada 10 minutos
    const limit = await rateLimit('verify-code', getClientIp(req), 10, 600);
    if (!limit.allowed) {
      res.setHeader('Retry-After', String(limit.retryAfterSeconds));
      return res.status(429).json({
        error: 'Demasiados intentos de verificación. Por favor espere un momento antes de intentar de nuevo.',
      });
    }

    const { name, code, org } = req.body ?? {};
    if (!isValidAccessCode(code)) {
      return res.status(401).json({ error: 'Código de acceso inválido.' });
    }

    const accessToken = await new SignJWT({
      holderName: sanitizeInput(name || 'Comprador Acreditado').slice(0, 120),
      org: sanitizeInput(org || 'Fideicomiso Patrimonial Privado').slice(0, 120),
      code: normalizeAccessCode(code),
      type: 'vip_code',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(getJwtSecret());

    return res.status(200).json({ success: true, accessToken });
  } catch (err) {
    console.error('Error in Vercel Serverless /api/verify-code:', (err as Error).message);
    return res.status(500).json({ error: 'Error interno al verificar código de acceso.' });
  }
}
