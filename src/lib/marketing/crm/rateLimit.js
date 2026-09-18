/**
 * Rate limiting en memoria para ingest de marketing (patrón answer-justify / reset-password).
 * Limitación: en serverless cada instancia tiene su propio bucket; protege contra abuso moderado.
 */

const WINDOW_MS = 60 * 1000;
const MAX_PER_IP_PER_ENDPOINT = 120;
const MAX_BUCKETS = 5000;

/** @type {Map<string, { n: number, reset: number }>} */
const buckets = new Map();

export function getClientIpFromRequest(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim().slice(0, 64);
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'unknown';
}

function pruneBuckets(now) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.reset) buckets.delete(key);
  }
  if (buckets.size > MAX_BUCKETS) buckets.clear();
}

/**
 * @param {string} ip
 * @param {string} endpoint - p.ej. "marketing:events"
 * @returns {boolean} true si el request puede continuar
 */
export function tryConsumeMarketingIngestRate(ip, endpoint) {
  const key = `${endpoint}:${ip || 'unknown'}`;
  const now = Date.now();
  pruneBuckets(now);

  let bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    bucket = { n: 0, reset: now + WINDOW_MS };
    buckets.set(key, bucket);
  }
  if (bucket.n >= MAX_PER_IP_PER_ENDPOINT) return false;
  bucket.n += 1;
  return true;
}
