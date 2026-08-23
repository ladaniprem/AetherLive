import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOrganizationId } from "../lib/auth";

export const getOne = query({
    args: {
        service: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const plugin = await ctx.db
            .query("plugins")
            .filter((q) =>
                q.and(
                    q.eq(q.field("service"), args.service),
                    q.eq(q.field("organizationId"), getOrganizationId(identity)),
                ),
            )
            .first();

        return plugin;
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

        const plugin = await ctx.db
            .query("plugins")
            .filter((q) =>
                q.and(
                    q.eq(q.field("service"), args.service),
                    q.eq(q.field("organizationId"), getOrganizationId(identity)),
                ),
            )
            .first();

        if (plugin) {
            await ctx.db.delete("plugins", plugin._id);
        }
    },
});
