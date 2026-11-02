import { Router } from 'express';
import { SignJWT } from 'jose';
import { sanitizeInput } from '../services/aiClient';

export const authRouter = Router();

export const VALID_ACCESS_CODES = ['ANIL-2026', 'CARONI-VIII', 'LANCARA', 'PATRIMONIAL', 'VIP-CARONI'];

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'caroni_dev_jwt_secret_change_in_production_2026'
);

// Rate limiter for /api/verify-code to prevent brute force (max 10 attempts per IP per 60 seconds)
const VERIFY_RATE_LIMIT_WINDOW_MS = 60000;
const VERIFY_RATE_LIMIT_MAX = 10;
const verifyRateLimitMap = new Map<string, { count: number; windowStart: number }>();

// Periodic eviction to prevent heap leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of verifyRateLimitMap.entries()) {
    if (now - entry.windowStart > VERIFY_RATE_LIMIT_WINDOW_MS) {
      verifyRateLimitMap.delete(ip);
    }
  }
}, 180000).unref();

function isVerifyRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = verifyRateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > VERIFY_RATE_LIMIT_WINDOW_MS) {
    verifyRateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > VERIFY_RATE_LIMIT_MAX;
}

authRouter.post('/api/verify-code', async (req, res) => {
  try {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    if (isVerifyRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Demasiados intentos de verificación. Por favor espere un momento antes de intentar de nuevo.',
      });
    }

    const { name, code, org } = req.body;
    const normalizedCode = String(code || '').trim().toUpperCase();
    const isValid = VALID_ACCESS_CODES.includes(normalizedCode) || normalizedCode.startsWith('RCAR-');

    if (!isValid) {
      return res.status(401).json({ error: 'Código de acceso inválido.' });
    }

    const accessToken = await new SignJWT({
      holderName: sanitizeInput(name || 'Comprador Acreditado'),
      org: sanitizeInput(org || 'Fideicomiso Patrimonial Privado'),
      code: normalizedCode,
      type: 'vip_code',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    return res.status(200).json({ success: true, accessToken });
  } catch (err) {
    console.error('Error processing /api/verify-code:', err);
    return res.status(500).json({ error: 'Error interno al verificar código de acceso.' });
  }
});
