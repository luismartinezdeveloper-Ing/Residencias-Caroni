/**
 * Rate limiting de ventana fija.
 * - Con UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN usa Redis (persistente y
 *   compartido entre instancias serverless).
 * - Sin ellas, cae a memoria del proceso: sirve en desarrollo y en Express de una sola
 *   instancia, pero en Vercel cada instancia lleva su propia cuenta.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();
const MEMORY_MAX_KEYS = 10_000;

function memoryHit(key: string, limit: number, windowSeconds: number, now: number): RateLimitResult {
  let entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    if (memoryStore.size >= MEMORY_MAX_KEYS) {
      for (const [k, v] of memoryStore) {
        if (v.resetAt <= now) memoryStore.delete(k);
      }
      if (memoryStore.size >= MEMORY_MAX_KEYS) memoryStore.clear();
    }
    entry = { count: 0, resetAt: now + windowSeconds * 1000 };
    memoryStore.set(key, entry);
  }
  entry.count++;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

async function upstashHit(
  url: string,
  token: string,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const response = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(windowSeconds), 'NX'],
      ['TTL', key],
    ]),
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`Upstash HTTP ${response.status}`);

  const [incr, , ttl] = (await response.json()) as Array<{ result?: number; error?: string }>;
  const count = Number(incr?.result);
  if (!Number.isFinite(count)) throw new Error(incr?.error || 'Upstash: respuesta inválida');

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Number(ttl?.result) || windowSeconds),
  };
}

export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
  env: NodeJS.ProcessEnv = process.env
): Promise<RateLimitResult> {
  const key = `rl:${bucket}:${identifier}`;
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      return await upstashHit(url, token, key, limit, windowSeconds);
    } catch (err) {
      console.warn('[RATE LIMIT] Upstash no disponible, usando memoria local:', (err as Error).message);
    }
  }
  return memoryHit(key, limit, windowSeconds, Date.now());
}

/** Solo para tests. */
export function resetMemoryRateLimits(): void {
  memoryStore.clear();
}
