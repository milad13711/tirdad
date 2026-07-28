/**
 * In-memory sliding-window rate limiter.
 *
 * Good enough for a single dev/staging instance. It resets on process
 * restart and does NOT work across multiple server instances — the master
 * spec calls for Redis-backed limiting in production, so swap the Map below
 * for a Redis (e.g. `INCR` + `EXPIRE`) implementation before scaling out
 * horizontally.
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxHits) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}
