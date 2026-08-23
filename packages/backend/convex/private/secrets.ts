import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "../lib/auth";

export const upsert = mutation({
    args: {
        service: v.string(),
        value: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const organizationId = getOrganizationId(identity);

        const existing = organizationId
            ? await ctx.db
                  .query("secrets")
                  .filter((q) =>
                      q.and(
                          q.eq(q.field("service"), args.service),
                          q.eq(q.field("organizationId"), organizationId),
                      ),
                  )
                  .first()
            : await ctx.db
                  .query("secrets")
                  .filter((q) =>
                      q.and(
                          q.eq(q.field("service"), args.service),
                          q.eq(q.field("organizationId"), undefined),
                      ),
                  )
                  .first();

        if (existing) {
            await ctx.db.patch("secrets", existing._id, {
                value: args.value,
            });
        } else {
            await ctx.db.insert("secrets", {
                service: args.service,
                value: args.value,
                ...(organizationId ? { organizationId } : {}),
            } as any);
        }
    },
});
