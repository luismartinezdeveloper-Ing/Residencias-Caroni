/**
 * Utilidades HTTP compartidas entre las funciones serverless (api/*) y Express (server/*)
 * Residencias Caroní · Altamira, Caracas
 */

import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http';

type HeaderValue = string | string[] | undefined;

function firstHeader(value: HeaderValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(',')[0]?.trim() || undefined;
}

/**
 * IP real del cliente. En Vercel `x-vercel-forwarded-for` y `x-real-ip` los fija la
 * plataforma y no se pueden falsificar desde el cliente, a diferencia de `x-forwarded-for`.
 * Fuera de Vercel (Express detrás de un proxy) se usa la IP resuelta por el socket/proxy.
 */
export function getClientIp(req: { headers: IncomingHttpHeaders; socket?: { remoteAddress?: string }; ip?: string }): string {
  return (
    firstHeader(req.headers['x-vercel-forwarded-for']) ||
    firstHeader(req.headers['x-real-ip']) ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Orígenes permitidos: los definidos en ALLOWED_ORIGINS (separados por coma) más
 * los dominios que Vercel expone para el despliegue actual.
 */
export function getAllowedOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const configured = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const vercelHosts = [env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL]
    .filter(Boolean)
    .map((host) => `https://${host}`);

  return [...new Set([...configured, ...vercelHosts])];
}

/**
 * Un origen es válido si coincide con la lista blanca o con el propio host de la petición
 * (peticiones same-origin del sitio). Sin cabecera Origin (curl, server-to-server) se
 * acepta: CORS solo protege navegadores y el rate limit cubre el resto.
 */
export function isOriginAllowed(origin: string | undefined, host: string | undefined, allowed = getAllowedOrigins()): boolean {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (allowed.includes(normalized)) return true;
  try {
    return !!host && new URL(normalized).host === host;
  } catch {
    return false;
  }
}

/**
 * Aplica CORS restringido y responde el preflight. Devuelve `true` si el handler ya
 * respondió (OPTIONS u origen rechazado) y no debe continuar.
 */
export function handleCors(
  req: IncomingMessage,
  res: ServerResponse,
  methods = 'POST, OPTIONS'
): boolean {
  const origin = firstHeader(req.headers.origin);
  const allowed = isOriginAllowed(origin, req.headers.host);

  res.setHeader('Vary', 'Origin');
  if (origin && allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  }

  if (!allowed) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Origen no permitido.' }));
    return true;
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}
