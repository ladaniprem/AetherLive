import { mutation } from "../_generated/server";
import { v } from "convex/values";

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

        const existing = await ctx.db
            .query("secrets")
            .filter((q) =>
                q.and(
                    q.eq(q.field("service"), args.service),
                    q.eq(q.field("organizationId"), identity.orgId),
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
                organizationId: identity.orgId,
                value: args.value,
            });
        }
    },
});
