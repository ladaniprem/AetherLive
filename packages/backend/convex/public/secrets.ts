import { query, mutation } from "../_generated/server";
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
                    q.eq(q.field("organizationId"), identity.orgId as string),
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
                organizationId: identity.orgId as string,
                value: args.value,
            });
        }
    },
});

export const getVapiSecrets = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        const secret = await ctx.db
            .query("secrets")
            .filter((q) =>
                q.and(
                    q.eq(q.field("service"), "vapi"),
                    q.eq(q.field("organizationId"), organizationId),
                ),
            )
            .first();

        if (!secret) {
            return null;
        }

        const value = secret.value as { publicApiKey?: string };
        return value.publicApiKey ? { publicApiKey: value.publicApiKey } : null;
    },
});
