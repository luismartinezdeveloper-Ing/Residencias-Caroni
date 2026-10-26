import { Router } from 'express';
import { SignJWT } from 'jose';
import { sanitizeInput } from '../services/aiClient';

export const authRouter = Router();

export const VALID_ACCESS_CODES = ['ANIL-2026', 'CARONI-VIII', 'LANCARA', 'PATRIMONIAL', 'VIP-CARONI'];

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'caroni_dev_jwt_secret_change_in_production_2026'
);

authRouter.post('/api/verify-code', async (req, res) => {
  try {
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
