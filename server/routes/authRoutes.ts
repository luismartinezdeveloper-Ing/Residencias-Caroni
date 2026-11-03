import { Router } from 'express';
import { SignJWT } from 'jose';
import { sanitizeInput } from '../services/aiClient';
import { getJwtSecret, isValidAccessCode, normalizeAccessCode } from '../security/auth';
import { getClientIp } from '../security/http';
import { rateLimit } from '../security/rateLimit';

export const authRouter = Router();

authRouter.post('/api/verify-code', async (req, res) => {
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
    console.error('Error processing /api/verify-code:', (err as Error).message);
    return res.status(500).json({ error: 'Error interno al verificar código de acceso.' });
  }
});
