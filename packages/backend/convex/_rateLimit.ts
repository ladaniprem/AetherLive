import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const checkAndIncrement = internalMutation({
  args: {
    rateLimitKey: v.string(),
    window: v.number(),
    max: v.number(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key_and_window", (q) =>
        q.eq("key", args.rateLimitKey).eq("window", args.window),
      )
      .first();

    if (existing) {
      if (existing.count >= args.max) {
        throw new Error("Too many requests. Please try again later.");
      }
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("rateLimits", {
        key: args.rateLimitKey,
        window: args.window,
        count: 1,
        expiresAt: args.expiresAt,
      });
    }
  },
});
