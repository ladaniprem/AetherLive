import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getOne = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const settings = await ctx.db
            .query("widgetSettings")
            .filter((q) => q.eq(q.field("organizationId"), identity.orgId))
            .first();

        return settings;
    },
});

export const upsert = mutation({
    args: {
        greetMessage: v.string(),
        defaultSuggestions: v.object({
            suggestion1: v.optional(v.string()),
            suggestion2: v.optional(v.string()),
            suggestion3: v.optional(v.string()),
        }),
        vapiSettings: v.object({
            assistantId: v.optional(v.string()),
            phoneNumber: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const existing = await ctx.db
            .query("widgetSettings")
            .filter((q) => q.eq(q.field("organizationId"), identity.orgId))
            .first();

        if (existing) {
            await ctx.db.patch("widgetSettings", existing._id, {
                greetMessage: args.greetMessage,
                defaultSuggestions: args.defaultSuggestions,
                vapiSettings: args.vapiSettings,
            });
        } else {
            await ctx.db.insert("widgetSettings", {
                organizationId: identity.orgId,
                greetMessage: args.greetMessage,
                defaultSuggestions: args.defaultSuggestions,
                vapiSettings: args.vapiSettings,
            });
        }
    },
});
