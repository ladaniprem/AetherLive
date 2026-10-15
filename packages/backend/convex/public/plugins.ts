import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "../lib/auth";
import { requireFeature } from "../lib/subscription";

// Lives in `public/` only because the dashboard Vapi view historically called
// it from there. It still requires an authenticated Clerk identity and an
// entitled org.

export const getOne = query({
    args: {
        service: v.string(),
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

        await requireFeature(ctx, organizationId, "integrations");

        return await ctx.db
            .query("plugins")
            .withIndex("by_service_and_organizationId", (q) =>
                q.eq("service", args.service).eq("organizationId", organizationId),
            )
            .first();
    },
});

export const upsert = mutation({
    args: {
        service: v.string(),
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

        await requireFeature(ctx, organizationId, "integrations");

        const existing = await ctx.db
            .query("plugins")
            .withIndex("by_service_and_organizationId", (q) =>
                q.eq("service", args.service).eq("organizationId", organizationId),
            )
            .first();

        if (existing) {
            await ctx.db.patch("plugins", existing._id, { enabled: true });
        } else {
            await ctx.db.insert("plugins", {
                service: args.service,
                organizationId,
                enabled: true,
            });
        }
    },
});

export const remove = mutation({
    args: {
        service: v.string(),
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

        await requireFeature(ctx, organizationId, "integrations");

        const plugin = await ctx.db
            .query("plugins")
            .withIndex("by_service_and_organizationId", (q) =>
                q.eq("service", args.service).eq("organizationId", organizationId),
            )
            .first();

        if (plugin) {
            await ctx.db.delete("plugins", plugin._id);
        }
    },
});
