import { vi } from "vitest";

/**
 * Test helper: make a mocked Convex ctx return an active Pro subscription when
 * the code under test looks up the `subscriptions` table, while leaving every
 * other table lookup to the caller's own mock.
 *
 * Gating is enforced with `requireFeature()` on every gated function, so a
 * bare `db.query` mock that returns `undefined` would resolve to the free
 * plan and make every happy-path test fail for the wrong reason.
 */
export const PRO_SUBSCRIPTION = {
  _id: "sub-1",
  organizationId: "org-123",
  plan: "pro",
  status: "active",
  updatedAt: 0,
} as const;

export const withSubscription = <T extends { db: { query: any } }>(
  ctx: T,
  subscription: Record<string, any> | null = PRO_SUBSCRIPTION,
): T => {
  const originalQuery = ctx.db.query;

  ctx.db.query = vi.fn((table: string, ...rest: any[]) => {
    if (table === "subscriptions") {
      const chain = {
        withIndex: vi.fn(() => chain),
        filter: vi.fn(() => chain),
        first: vi.fn().mockResolvedValue(subscription),
        collect: vi.fn().mockResolvedValue(subscription ? [subscription] : []),
        order: vi.fn(() => chain),
        paginate: vi.fn().mockResolvedValue({ page: [], isDone: true, continueCursor: null }),
      };
      return chain;
    }
    return originalQuery(table, ...rest);
  });

  return ctx;
};

/** Same as `withSubscription` but for a free org (no subscription row). */
export const withFreePlan = <T extends { db: { query: any } }>(ctx: T): T =>
  withSubscription(ctx, null);

/** Same, but Pro with a lapsed payment — must resolve to free entitlements. */
export const withLapsedPro = <T extends { db: { query: any } }>(ctx: T): T =>
  withSubscription(ctx, {
    _id: "sub-1",
    organizationId: "org-123",
    plan: "pro",
    status: "past_due",
    updatedAt: 0,
  });
