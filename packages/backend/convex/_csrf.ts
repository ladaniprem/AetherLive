import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const generateToken = internalMutation({
  args: {
    organizationId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const expired = await ctx.db
      .query("csrfTokens")
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.lt(q.field("expiresAt"), now),
        ),
      )
      .collect();
    await Promise.all(expired.map((t) => ctx.db.delete(t._id)));

    await ctx.db.insert("csrfTokens", {
      token: args.token,
      organizationId: args.organizationId,
      expiresAt: args.expiresAt,
    });
  },
});
