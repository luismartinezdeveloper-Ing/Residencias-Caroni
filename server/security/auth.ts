/**
 * Secreto JWT, códigos de acceso VIP y verificación de tokens.
 * Los códigos viven en la variable de entorno ACCESS_CODES (separados por coma),
 * nunca en el código fuente.
 */

import { createHash, timingSafeEqual } from 'crypto';
import { jwtVerify, type JWTPayload } from 'jose';

const DEV_FALLBACK_SECRET = 'caroni_dev_jwt_secret_local_only';

export function isProductionEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production';
}

/**
 * En producción exige un JWT_SECRET de al menos 32 caracteres; en desarrollo usa
 * un secreto local para no bloquear el arranque.
 */
export function getJwtSecret(env: NodeJS.ProcessEnv = process.env): Uint8Array {
  const secret = env.JWT_SECRET;
  if (secret && secret.length >= 32 && !secret.includes('caroni_dev_jwt_secret')) {
    return new TextEncoder().encode(secret);
  }
  if (isProductionEnv(env)) {
    throw new Error('JWT_SECRET no configurado o inseguro (mínimo 32 caracteres).');
  }
  return new TextEncoder().encode(DEV_FALLBACK_SECRET);
}

export function normalizeAccessCode(code: unknown): string {
  return String(code ?? '').trim().toUpperCase();
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export function getConfiguredAccessCodes(env: NodeJS.ProcessEnv = process.env): string[] {
  return (env.ACCESS_CODES || '')
    .split(',')
    .map(normalizeAccessCode)
    .filter((code) => code.length >= 6);
}

/**
 * Compara en tiempo constante contra todos los códigos configurados.
 * Sin ACCESS_CODES no se acepta ningún código (falla cerrado).
 */
export function isValidAccessCode(code: unknown, env: NodeJS.ProcessEnv = process.env): boolean {
  const candidate = normalizeAccessCode(code);
  if (!candidate || candidate.length > 64) return false;

  const candidateDigest = digest(candidate);
  let match = false;
  for (const valid of getConfiguredAccessCodes(env)) {
    if (timingSafeEqual(candidateDigest, digest(valid))) match = true;
  }
  return match;
}

export type AccessTokenType = 'vip_code' | 'lead_access';

export async function verifyAccessToken(
  token: string | undefined,
  env: NodeJS.ProcessEnv = process.env
): Promise<(JWTPayload & { type: AccessTokenType }) | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(env), { algorithms: ['HS256'] });
    if (payload.type !== 'vip_code' && payload.type !== 'lead_access') return null;
    return payload as JWTPayload & { type: AccessTokenType };
  } catch {
    return null;
  }
}
