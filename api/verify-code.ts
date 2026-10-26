import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT } from 'jose';

const VALID_ACCESS_CODES = ['ANIL-2026', 'CARONI-VIII', 'LANCARA', 'PATRIMONIAL', 'VIP-CARONI'];
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'caroni_dev_jwt_secret_change_in_production_2026'
);

function sanitizeInput(value: string): string {
  return String(value || '').replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '').trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    console.error('Error in Vercel Serverless /api/verify-code:', err);
    return res.status(500).json({ error: 'Error interno al verificar código de acceso.' });
  }
}
