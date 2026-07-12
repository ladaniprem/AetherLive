import { v } from "convex/values";
import { action } from "../_generated/server";

const CSRF_TOKEN_TTL_MS = 5 * 60 * 1000;

export const generate = action({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const token = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + CSRF_TOKEN_TTL_MS;

    await ctx.runMutation("_csrf:generateToken" as any, {
      organizationId: args.organizationId,
      token,
      expiresAt,
    });

    return { token, expiresAt };
  },
});
