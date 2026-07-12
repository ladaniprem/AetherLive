const rateMap = new Map<string, { count: number; resetAt: number }>();

const CONFIG = {
  sentryTunnel: { max: 30, windowMs: 60_000 },
  health: { max: 60, windowMs: 60_000 },
} as const;

export type RateLimitEndpoint = keyof typeof CONFIG;

export function checkRateLimit(
  endpoint: RateLimitEndpoint,
  identifier: string,
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = CONFIG[endpoint];
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();

  let entry = rateMap.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs };
    rateMap.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, config.max - entry.count);

  return {
    allowed: entry.count <= config.max,
    remaining,
    resetIn: entry.resetAt - now,
  };
}
