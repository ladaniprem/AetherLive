import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "../lib/auth";
import { requireFeature } from "../lib/subscription";

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

        // Storing provider credentials is the Integrations capability.
        await requireFeature(ctx, organizationId, "integrations");

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
            } as any);
        }
    },
});
