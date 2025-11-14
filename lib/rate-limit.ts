interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitBucket {
  count: number;
  expiresAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

export function rateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.expiresAt <= now) {
    buckets.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });

    return {
      success: true,
      remaining: Math.max(0, limit - 1),
      retryAfterMs: 0,
    } as const;
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterMs: Math.max(0, bucket.expiresAt - now),
    } as const;
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    success: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterMs: 0,
  } as const;
}
