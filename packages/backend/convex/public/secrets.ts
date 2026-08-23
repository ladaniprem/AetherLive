import { query, mutation } from "../_generated/server";
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
        if (!organizationId) {
            throw new Error("Missing organization");
        }

        const existing = await ctx.db
            .query("secrets")
            .withIndex("by_service_and_organizationId", (q) =>
                q.eq("service", args.service).eq("organizationId", organizationId),
            )
            .first();

        if (existing) {
            await ctx.db.patch("secrets", existing._id, {
                value: args.value,
            });
        } else {
            await ctx.db.insert("secrets", {
                service: args.service,
                organizationId,
                value: args.value,
            });
        }
    },
});

export const getVapiSecrets = query({
    args: {
        organizationId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args;

        const secret = organizationId
            ? await ctx.db
                  .query("secrets")
                  .filter((q) =>
                      q.and(
                          q.eq(q.field("service"), "vapi"),
                          q.eq(q.field("organizationId"), organizationId),
                      ),
                  )
                  .first()
            : await ctx.db
                  .query("secrets")
                  .filter((q) =>
                      q.and(
                          q.eq(q.field("service"), "vapi"),
                          q.eq(q.field("organizationId"), undefined),
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
