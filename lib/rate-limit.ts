/**
 * In-memory sliding-window rate limiter for administrative endpoints.
 * Thread-safe for single-instance Node.js processes.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

/**
 * Checks whether an action for a given identifier exceeds maxRequests within windowSeconds.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = store.get(identifier);

  if (!existing || existing.resetAt <= now) {
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs
    };
    store.set(identifier, record);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt: record.resetAt
    };
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt
  };
}

/**
 * Checks whether an identifier is currently blocked by rate limiting without mutating state.
 */
export function isRateLimited(identifier: string, maxRequests: number): boolean {
  const now = Date.now();
  const existing = store.get(identifier);
  if (!existing || existing.resetAt <= now) {
    return false;
  }
  return existing.count >= maxRequests;
}

/**
 * Records a failed attempt for an identifier.
 */
export function recordFailedAttempt(
  identifier: string,
  windowSeconds: number,
  maxRequests = 5
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = store.get(identifier);

  if (!existing || existing.resetAt <= now) {
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs
    };
    store.set(identifier, record);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt: record.resetAt
    };
  }

  existing.count += 1;
  const isAllowed = existing.count < maxRequests;
  return {
    success: isAllowed,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - existing.count),
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
  };
}

/**
 * Resets rate limit for an identifier (e.g. upon successful authentication).
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

/**
 * Helper to get a stable client IP from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
