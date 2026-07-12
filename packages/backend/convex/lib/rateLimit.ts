import type { MutationCtx, QueryCtx, ActionCtx } from "../_generated/server";

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  contactSessionCreate: { max: 5, windowMs: 60_000 },
  contactSessionValidate: { max: 20, windowMs: 60_000 },
  publicMessageCreate: { max: 10, windowMs: 60_000 },
  publicMessageGetMany: { max: 30, windowMs: 60_000 },
  conversationGetOne: { max: 30, windowMs: 60_000 },
  organizationValidate: { max: 10, windowMs: 60_000 },
  messageCreate: { max: 20, windowMs: 60_000 },
  enhanceResponse: { max: 10, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitConfig>;

export type RateLimitKey = keyof typeof RATE_LIMITS;

export async function checkRateLimit(
  ctx: MutationCtx,
  key: RateLimitKey,
  identifier: string,
): Promise<void> {
  await checkRateLimitByDb(ctx.db, key, identifier);
}

async function checkRateLimitByDb(
  db: MutationCtx["db"],
  key: RateLimitKey,
  identifier: string,
): Promise<void> {
  const config = RATE_LIMITS[key];
  const now = Date.now();
  const window = Math.floor(now / config.windowMs);

  const rateLimitKey = `${key}:${identifier}`;

  const existing = await db
    .query("rateLimits")
    .withIndex("by_key_and_window", (q) =>
      q.eq("key", rateLimitKey).eq("window", window),
    )
    .first();

  if (existing) {
    if (existing.count >= config.max) {
      throw new Error("Too many requests. Please try again later.");
    }
    await db.patch(existing._id, { count: existing.count + 1 });
  } else {
    await db.insert("rateLimits", {
      key: rateLimitKey,
      window,
      count: 1,
      expiresAt: (window + 1) * config.windowMs,
    });
  }
}

export async function checkRateLimitQuery(
  ctx: QueryCtx,
  key: RateLimitKey,
  identifier: string,
): Promise<void> {
  const config = RATE_LIMITS[key];
  const now = Date.now();
  const window = Math.floor(now / config.windowMs);
  const rateLimitKey = `${key}:${identifier}`;

  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key_and_window", (q) =>
      q.eq("key", rateLimitKey).eq("window", window),
    )
    .first();

  if (existing && existing.count >= config.max) {
    throw new Error("Too many requests. Please try again later.");
  }
}

export async function checkRateLimitAction(
  ctx: ActionCtx,
  key: RateLimitKey,
  identifier: string,
): Promise<void> {
  const config = RATE_LIMITS[key];
  const now = Date.now();
  const window = Math.floor(now / config.windowMs);
  await ctx.runMutation("_rateLimit:checkAndIncrement" as any, {
    rateLimitKey: `${key}:${identifier}`,
    window,
    max: config.max,
    expiresAt: (window + 1) * config.windowMs,
  });
}
